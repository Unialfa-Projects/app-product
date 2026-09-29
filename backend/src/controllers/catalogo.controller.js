// Controller = a camada que fala com o mundo HTTP: recebe a requisição, chama
// os Repositories para ler/gravar dados, e devolve a resposta. Não escreve SQL.
import { db } from '../database/index.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { UnidadeMedidaRepository } from '../repositories/UnidadeMedidaRepository.js';
// Este preHandler exige uma chave com o perfil indicado em cada rota.
import { exigirPerfil } from '../auth.js';
// ApiError cria erros HTTP claros; idDaRota valida o :id da URL.
import { ApiError, idDaRota } from '../http.js';
// Os schemas descrevem os campos aceitos nos corpos JSON.
import { criarCategoriaSchema, atualizarCategoriaSchema, criarUnidadeSchema } from '../schemas/catalogo.schema.js';

const categoriaRepository = new CategoriaRepository(db);
const unidadeMedidaRepository = new UnidadeMedidaRepository(db);

// Confere se uma categoria pode ser usada como pai de outra.
async function verificarCategoriaPai(idPai, idAtual = null) {
  // null ou undefined significa que esta categoria não terá pai.
  if (idPai === null || idPai === undefined) return;
  // Uma categoria não pode apontar para si mesma.
  if (idPai === idAtual) throw new ApiError(422, 'CATEGORIA_PAI_INVALIDA', 'Categoria não pode ser pai de si mesma');

  // Busca o pai informado e exige que ele ainda esteja ativo.
  const paiAtivo = await categoriaRepository.existeAtiva(idPai);
  if (!paiAtivo) throw new ApiError(422, 'CATEGORIA_PAI_INVALIDA', 'Categoria pai inexistente ou inativa');

  // Na criação idAtual é null; na edição também precisamos impedir ciclos na árvore.
  if (idAtual !== null) {
    const formaCiclo = await categoriaRepository.ehDescendente(idAtual, idPai);
    // Se o novo pai está entre os descendentes, a mudança criaria um ciclo.
    if (formaCiclo) throw new ApiError(422, 'CICLO_CATEGORIA', 'Categoria pai é descendente da categoria');
  }
}

// Registra no Fastify as rotas de categoria e unidade de medida.
export async function catalogoController(app) {
  // POST permite que operador ou gestor cadastre uma categoria.
  app.post('/api/categorias', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request, reply) => {
    // Valida o nome e o ID opcional da categoria pai.
    const dados = criarCategoriaSchema.parse(request.body);
    // Confere se o pai informado realmente pode ser usado.
    await verificarCategoriaPai(dados.categoria_pai_id);
    const categoria = await categoriaRepository.criar({ nome: dados.nome, categoriaPaiId: dados.categoria_pai_id });
    // 201 informa ao cliente que um novo registro foi criado.
    return reply.code(201).send(categoria);
  });

  // GET entrega todas as categorias, inclusive as inativas.
  app.get('/api/categorias', async () => {
    const categorias = await categoriaRepository.listarTodas();
    // Mantém o mesmo formato { dados: [...] } usado nas outras listagens.
    return { dados: categorias };
  });

  // PUT altera o nome, o pai ou os dois campos da categoria.
  app.put('/api/categorias/:id', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request) => {
    // Valida o ID da URL e o JSON com as alterações solicitadas.
    const id = idDaRota(request);
    const dados = atualizarCategoriaSchema.parse(request.body);
    // Impede apontar a categoria para si própria ou para um descendente.
    await verificarCategoriaPai(dados.categoria_pai_id, id);
    const categoria = await categoriaRepository.atualizar(id, {
      nome: dados.nome,
      categoriaPaiId: dados.categoria_pai_id,
      // Diferencia "campo não veio no corpo" de "campo veio como null".
      categoriaPaiIdInformado: Object.hasOwn(dados, 'categoria_pai_id'),
    });
    // Nenhuma linha alterada significa que o ID não existe.
    if (!categoria) throw new ApiError(404, 'CATEGORIA_NAO_ENCONTRADA', 'Categoria não encontrada');
    return categoria;
  });

  // DELETE inativa a categoria sem apagá-la fisicamente.
  app.delete('/api/categorias/:id', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Apenas a chave de gestor passa pelo preHandler desta rota.
    const id = idDaRota(request);
    // A checagem de produtos e o UPDATE precisam ocorrer na mesma transação.
    return db.transacao(async (cliente) => {
      // Bloqueia a categoria para impedir alteração simultânea nesta operação.
      const existe = await categoriaRepository.bloquearPorId(id, cliente);
      if (!existe) throw new ApiError(404, 'CATEGORIA_NAO_ENCONTRADA', 'Categoria não encontrada');
      // Um produto ativo impede a inativação de sua categoria.
      const emUso = await categoriaRepository.possuiProdutoAtivo(id, cliente);
      if (emUso) throw new ApiError(409, 'CATEGORIA_EM_USO', 'Categoria possui produto ativo');
      // transacao faz COMMIT depois que esta função devolve o resultado.
      return categoriaRepository.inativar(id, cliente);
    });
  });

  // POST cadastra uma unidade de medida, como unidade, quilo ou litro.
  app.post('/api/unidades-medida', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request, reply) => {
    // Valida nome, sigla, descrição e casas decimais antes do INSERT.
    const dados = criarUnidadeSchema.parse(request.body);
    const unidade = await unidadeMedidaRepository.criar({
      nome: dados.nome, sigla: dados.sigla, descricao: dados.descricao, casasDecimais: dados.casas_decimais,
    });
    // Devolve 201 e a unidade criada.
    return reply.code(201).send(unidade);
  });

  // GET apresenta as unidades disponíveis em ordem alfabética.
  app.get('/api/unidades-medida', async () => {
    const unidades = await unidadeMedidaRepository.listarTodas();
    // Envolve o array em dados para manter padrão com as demais listagens.
    return { dados: unidades };
  });
}
