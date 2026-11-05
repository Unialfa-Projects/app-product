// Controller = a camada que fala com o mundo HTTP: recebe a requisição, chama
// os Repositories para ler/gravar dados, e devolve a resposta. Não escreve SQL.
import { db } from '../database/index.js';
import { ProdutoRepository } from '../repositories/ProdutoRepository.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { UnidadeMedidaRepository } from '../repositories/UnidadeMedidaRepository.js';
import { HistoricoPrecoRepository } from '../repositories/HistoricoPrecoRepository.js';
// Este preHandler exige uma chave com o perfil indicado em cada rota.
import { exigirPerfil } from '../auth.js';
// ApiError cria erros HTTP claros; idDaRota valida o :id da URL.
import { ApiError, idDaRota } from '../http.js';
// Os schemas descrevem os campos aceitos nos corpos JSON e nos filtros.
import { criarProdutoSchema, atualizarProdutoSchema, listaProdutosSchema, idsSchema } from '../schemas/produto.schema.js';

const produtoRepository = new ProdutoRepository(db);
const categoriaRepository = new CategoriaRepository(db);
const unidadeMedidaRepository = new UnidadeMedidaRepository(db);
const historicoPrecoRepository = new HistoricoPrecoRepository(db);

// Confere se as duas relações obrigatórias do produto apontam para registros
// válidos. Sempre roda dentro de uma transação, por isso recebe "executor".
async function verificarCategoriaEUnidade(executor, categoriaId, unidadeId) {
  const categoriaAtiva = await categoriaRepository.bloquearAtivaPorId(categoriaId, executor);
  if (!categoriaAtiva) throw new ApiError(422, 'CATEGORIA_INVALIDA', 'Categoria inexistente ou inativa');

  const unidadeExiste = await unidadeMedidaRepository.existePorId(unidadeId, executor);
  if (!unidadeExiste) throw new ApiError(422, 'UNIDADE_INVALIDA', 'Unidade de medida inexistente');
}

// Registra todas as rotas HTTP relacionadas a produtos no Fastify.
export async function produtoController(app) {
  // POST cadastra; operador e gestor podem executar a rota.
  app.post('/api/produtos', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request, reply) => {
    // parse valida o JSON e devolve somente os campos aceitos pelo schema.
    const dados = criarProdutoSchema.parse(request.body);

    // Produto e preço inicial precisam ser gravados juntos ou desfeitos juntos.
    const produto = await db.transacao(async (cliente) => {
      // Verifica os IDs usados como chaves estrangeiras antes do INSERT.
      await verificarCategoriaEUnidade(cliente, dados.categoria_id, dados.unidade_medida_id);

      const id = await produtoRepository.criar({
        sku: dados.sku,
        nome: dados.nome,
        descricao: dados.descricao,
        categoriaId: dados.categoria_id,
        unidadeMedidaId: dados.unidade_medida_id,
        preco: dados.preco,
        estoque: dados.estoque,
      }, cliente);

      // Usa o ID recém-criado para ligar o produto ao seu primeiro registro de preço.
      await historicoPrecoRepository.abrirRegistroInicial({
        produtoId: id, preco: dados.preco, usuarioId: dados.usuario_id,
      }, cliente);

      // Lê o produto antes de confirmar para devolver a mesma estrutura das consultas GET.
      return produtoRepository.buscarPorId(id, cliente);
    });

    // HTTP 201 indica que o cadastro foi criado com sucesso.
    return reply.code(201).send(produto);
  });

  // GET lista produtos e aplica filtros opcionais com paginação.
  app.get('/api/produtos', async (request) => {
    // Converte e valida os parâmetros da URL, como ?pagina=2&limite=20.
    const filtro = listaProdutosSchema.parse(request.query);

    // Conta todos os produtos encontrados antes de aplicar o limite da página.
    const total = await produtoRepository.contar(filtro);
    const produtos = await produtoRepository.listar(filtro);

    // Devolve itens e metadados para o cliente montar os controles de página.
    return { dados: produtos, pagina: filtro.pagina, limite: filtro.limite, total };
  });

  // POST em /lote recebe { ids: [...] } e consulta vários produtos de uma vez.
  app.post('/api/produtos/lote', async (request) => {
    // Aceita de 1 a 100 números inteiros positivos.
    const { ids } = idsSchema.parse(request.body);
    const produtos = await produtoRepository.buscarPorIds(ids);
    // IDs inexistentes simplesmente não aparecem na lista de resultados.
    return { dados: produtos };
  });

  // GET por ID devolve um produto específico.
  app.get('/api/produtos/:id', async (request) => {
    // idDaRota converte e valida o trecho :id da URL.
    const produto = await produtoRepository.buscarPorId(idDaRota(request));
    // Responde 404 quando a consulta não encontra esse ID.
    if (!produto) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
    return produto;
  });

  // PUT altera somente os campos enviados no corpo da requisição.
  app.put('/api/produtos/:id', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request) => {
    // Valida o ID da URL e os campos que podem ser alterados.
    const id = idDaRota(request);
    const dados = atualizarProdutoSchema.parse(request.body);
    // Alteração de preço é reservada à chave de gestor.
    if (dados.preco !== undefined && request.usuario !== 'gestor') {
      throw new ApiError(403, 'ACESSO_NEGADO', 'Apenas gestor pode alterar o preço');
    }

    // UPDATE do produto e mudança no histórico de preço formam uma única transação.
    return db.transacao(async (cliente) => {
      // FOR UPDATE impede outra alteração do mesmo produto até esta terminar.
      const atual = await produtoRepository.bloquearPorId(id, cliente);
      // Não é possível alterar um produto inexistente.
      if (!atual) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');

      // Se o cliente não enviou uma nova relação, preserva o ID atual.
      const categoriaId = dados.categoria_id ?? atual.categoria_id;
      const unidadeId = dados.unidade_medida_id ?? atual.unidade_medida_id;
      // Confere se a categoria continua ativa e se a unidade existe.
      await verificarCategoriaEUnidade(cliente, categoriaId, unidadeId);

      // Sobrepõe os campos enviados aos valores antigos; os demais ficam como estavam.
      const novo = { ...atual, ...dados };
      await produtoRepository.atualizar(id, {
        nome: novo.nome,
        descricao: novo.descricao,
        categoriaId,
        unidadeMedidaId: unidadeId,
        preco: novo.preco,
        estoque: novo.estoque,
      }, cliente);

      // O histórico só muda quando o valor do preço realmente mudou.
      if (Number(novo.preco) !== Number(atual.preco)) {
        // Usa o mesmo instante para encerrar a vigência antiga e iniciar a nova.
        const inicio = new Date();
        await historicoPrecoRepository.encerrarVigenciaAtual(id, inicio, cliente);
        await historicoPrecoRepository.abrirNovaVigencia({
          produtoId: id, preco: novo.preco, inicio, motivo: dados.motivo, usuarioId: dados.usuario_id,
        }, cliente);
      }

      // Retorna o estado já atualizado usando a mesma conexão da transação.
      return produtoRepository.buscarPorId(id, cliente);
    });
  });

  // DELETE faz exclusão lógica: mantém a linha e marca ativo=false.
  app.delete('/api/produtos/:id', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Somente o gestor passa pelo preHandler acima.
    const id = idDaRota(request);
    const inativado = await produtoRepository.inativar(id);
    // Sem linha afetada, o produto não existe.
    if (!inativado) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
    // Devolve o produto para o cliente ver ativo=false e situacao=inativo.
    return produtoRepository.buscarPorId(id);
  });

  // Esta rota desfaz a inativação de um produto.
  app.post('/api/produtos/:id/reativar', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Valida o identificador antes da consulta SQL.
    const id = idDaRota(request);
    const reativado = await produtoRepository.reativarSeCategoriaAtiva(id);
    // Sem linha alterada, o produto não existe ou a categoria está inativa.
    if (!reativado) throw new ApiError(409, 'REATIVACAO_INDISPONIVEL', 'Produto inexistente ou categoria inativa');
    return produtoRepository.buscarPorId(id);
  });

  // Consulta todas as vigências de preço; a chave de gestor protege essa informação.
  app.get('/api/produtos/:id/historico-precos', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Converte o parâmetro da URL para um ID numérico válido.
    const id = idDaRota(request);
    // Primeiro confirma que o produto existe.
    if (!await produtoRepository.buscarPorId(id)) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
    const historico = await historicoPrecoRepository.listarPorProduto(id);
    return { dados: historico };
  });
}
