// pool faz consultas; transacao agrupa operações que devem ser confirmadas juntas.
import { pool, transacao } from '../db.js';
// Este preHandler exige uma chave com o perfil indicado em cada rota.
import { exigirPerfil } from '../auth.js';
// ApiError cria erros HTTP claros; idDaRota valida o :id da URL.
import { ApiError, idDaRota } from '../http.js';
// Os schemas descrevem os campos aceitos nos corpos JSON.
import { criarCategoriaSchema, atualizarCategoriaSchema, criarUnidadeSchema } from '../schemas/catalogo.schema.js';

// Confere se uma categoria pode ser usada como pai de outra.
async function verificarCategoriaPai(idPai, idAtual = null) {
  // null ou undefined significa que esta categoria não terá pai.
  if (idPai === null || idPai === undefined) return;
  // Uma categoria não pode apontar para si mesma.
  if (idPai === idAtual) throw new ApiError(422, 'CATEGORIA_PAI_INVALIDA', 'Categoria não pode ser pai de si mesma');

  // Busca o pai informado e exige que ele ainda esteja ativo.
  const pai = await pool.query('SELECT id FROM categoria WHERE id=$1 AND ativo=true', [idPai]);
  // Rejeita um ID sem registro correspondente.
  if (!pai.rowCount) throw new ApiError(422, 'CATEGORIA_PAI_INVALIDA', 'Categoria pai inexistente ou inativa');

  // Na criação idAtual é null; na edição também precisamos impedir ciclos na árvore.
  if (idAtual !== null) {
    // WITH RECURSIVE começa na categoria atual e percorre todos os seus descendentes.
    const descendente = await pool.query(`WITH RECURSIVE arvore AS (
      -- Primeiro coloca a própria categoria na árvore.
      SELECT id FROM categoria WHERE id=$1
      UNION ALL
      -- Depois acrescenta cada categoria cujo pai já está na árvore.
      SELECT c.id FROM categoria c JOIN arvore a ON c.categoria_pai_id=a.id
    ) SELECT id FROM arvore WHERE id=$2`, [idAtual, idPai]);
    // Se o novo pai está entre os descendentes, a mudança criaria um ciclo.
    if (descendente.rowCount) throw new ApiError(422, 'CICLO_CATEGORIA', 'Categoria pai é descendente da categoria');
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
    // Insere a nova categoria e pede ao banco que devolva a linha criada.
    const resultado = await pool.query(`INSERT INTO categoria (nome, categoria_pai_id)
      VALUES ($1, $2) RETURNING *`, [dados.nome, dados.categoria_pai_id ?? null]);
    // 201 informa ao cliente que um novo registro foi criado.
    return reply.code(201).send(resultado.rows[0]);
  });

  // GET entrega todas as categorias, inclusive as inativas.
  app.get('/api/categorias', async () => {
    // ORDER BY deixa a lista em ordem alfabética.
    const resultado = await pool.query('SELECT * FROM categoria ORDER BY nome');
    // Mantém o mesmo formato { dados: [...] } usado nas outras listagens.
    return { dados: resultado.rows };
  });

  // PUT altera o nome, o pai ou os dois campos da categoria.
  app.put('/api/categorias/:id', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request) => {
    // Valida o ID da URL e o JSON com as alterações solicitadas.
    const id = idDaRota(request);
    const dados = atualizarCategoriaSchema.parse(request.body);
    // Impede apontar a categoria para si própria ou para um descendente.
    await verificarCategoriaPai(dados.categoria_pai_id, id);
    // COALESCE preserva nome se não veio outro; CASE diferencia campo ausente de null.
    const resultado = await pool.query(`UPDATE categoria SET nome=COALESCE($1, nome),
      categoria_pai_id=CASE WHEN $2::boolean THEN $3 ELSE categoria_pai_id END
      WHERE id=$4 RETURNING *`,
    // $2 informa se categoria_pai_id apareceu; $3 é o novo pai ou null para removê-lo.
    [dados.nome ?? null, Object.hasOwn(dados, 'categoria_pai_id'), dados.categoria_pai_id ?? null, id]);
    // Nenhuma linha alterada significa que o ID não existe.
    if (!resultado.rowCount) throw new ApiError(404, 'CATEGORIA_NAO_ENCONTRADA', 'Categoria não encontrada');
    // Devolve a categoria já atualizada.
    return resultado.rows[0];
  });

  // DELETE inativa a categoria sem apagá-la fisicamente.
  app.delete('/api/categorias/:id', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Apenas a chave de gestor passa pelo preHandler desta rota.
    const id = idDaRota(request);
    // A checagem de produtos e o UPDATE precisam ocorrer na mesma transação.
    return transacao(async (banco) => {
      // Bloqueia a categoria para impedir alteração simultânea nesta operação.
      const categoria = await banco.query('SELECT id FROM categoria WHERE id=$1 FOR UPDATE', [id]);
      // Responde 404 caso a categoria não exista.
      if (!categoria.rowCount) throw new ApiError(404, 'CATEGORIA_NAO_ENCONTRADA', 'Categoria não encontrada');
      // Um produto ativo impede a inativação de sua categoria.
      const produto = await banco.query('SELECT 1 FROM produto WHERE categoria_id=$1 AND ativo=true LIMIT 1', [id]);
      // rowCount positivo mostra que pelo menos um produto foi encontrado.
      if (produto.rowCount) throw new ApiError(409, 'CATEGORIA_EM_USO', 'Categoria possui produto ativo');
      // Como não existem produtos ativos vinculados, marca ativo=false.
      const resultado = await banco.query('UPDATE categoria SET ativo=false WHERE id=$1 RETURNING *', [id]);
      // transacao faz COMMIT depois que esta função devolve o resultado.
      return resultado.rows[0];
    });
  });

  // POST cadastra uma unidade de medida, como unidade, quilo ou litro.
  app.post('/api/unidades-medida', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request, reply) => {
    // Valida nome, sigla, descrição e casas decimais antes do INSERT.
    const dados = criarUnidadeSchema.parse(request.body);
    // Valores ficam separados da SQL para não montar comandos com texto do usuário.
    const resultado = await pool.query(`INSERT INTO unidade_medida
      (nome, sigla, descricao, casas_decimais) VALUES ($1, $2, $3, $4) RETURNING *`,
    [dados.nome, dados.sigla, dados.descricao ?? null, dados.casas_decimais]);
    // Devolve 201 e a unidade criada.
    return reply.code(201).send(resultado.rows[0]);
  });

  // GET apresenta as unidades disponíveis em ordem alfabética.
  app.get('/api/unidades-medida', async () => {
    // A consulta devolve todas as linhas de unidade_medida.
    const resultado = await pool.query('SELECT * FROM unidade_medida ORDER BY nome');
    // Envolve o array em dados para manter padrão com as demais listagens.
    return { dados: resultado.rows };
  });
}
