// pool executa consultas comuns; transacao agrupa consultas que devem funcionar juntas.
import { pool, transacao } from '../db.js';
// exigirPerfil protege as rotas de escrita conforme a chave de API recebida.
import { exigirPerfil } from '../auth.js';
// Estas funções padronizam erros, IDs da URL e o formato de saída do produto.
import { ApiError, aplicarEstado, idDaRota } from '../http.js';
// Os schemas validam corpo e filtros antes de qualquer acesso ao banco.
import { criarProdutoSchema, atualizarProdutoSchema, listaProdutosSchema, idsSchema } from '../schemas/produto.schema.js';

// Consulta reutilizada pelas rotas: traz o produto e nomes úteis das tabelas relacionadas.
const consultaProduto = `SELECT p.*, c.nome AS categoria, u.sigla AS unidade
  -- p é o apelido da tabela produto nas consultas.
  FROM produto p
  -- Cada produto pertence a uma categoria.
  JOIN categoria c ON c.id = p.categoria_id
  -- Cada produto também possui uma unidade de medida.
  JOIN unidade_medida u ON u.id = p.unidade_medida_id`;

// Busca um único produto pelo ID; banco pode ser o pool ou a conexão de uma transação.
async function buscarProduto(id, banco = pool) {
  // $1 é substituído pelo valor de id de forma segura pelo driver pg.
  const resultado = await banco.query(`${consultaProduto} WHERE p.id = $1`, [id]);
  // Retorna null quando não encontrou; aplicarEstado prepara números e situação para o JSON.
  return resultado.rows[0] ? aplicarEstado(resultado.rows[0]) : null;
}

// Confere se as duas relações obrigatórias do produto apontam para registros válidos.
async function verificarCategoriaEUnidade(banco, categoriaId, unidadeId) {
  // FOR UPDATE bloqueia a categoria durante a transação para evitar inativação simultânea.
  const categoria = await banco.query('SELECT id FROM categoria WHERE id = $1 AND ativo = true FOR UPDATE', [categoriaId]);
  // rowCount igual a zero indica ID inexistente ou categoria inativa.
  if (!categoria.rowCount) throw new ApiError(422, 'CATEGORIA_INVALIDA', 'Categoria inexistente ou inativa');

  // A unidade precisa existir; esta tabela não tem campo ativo.
  const unidade = await banco.query('SELECT id FROM unidade_medida WHERE id = $1', [unidadeId]);
  // Impede que o banco receba um produto com unidade inválida.
  if (!unidade.rowCount) throw new ApiError(422, 'UNIDADE_INVALIDA', 'Unidade de medida inexistente');
}

// Registra todas as rotas HTTP relacionadas a produtos no Fastify.
export async function produtoController(app) {
  // POST cadastra; operador e gestor podem executar a rota.
  app.post('/api/produtos', { preHandler: exigirPerfil(['operador', 'gestor']) }, async (request, reply) => {
    // parse valida o JSON e devolve somente os campos aceitos pelo schema.
    const dados = criarProdutoSchema.parse(request.body);

    // Produto e preço inicial precisam ser gravados juntos ou desfeitos juntos.
    const produto = await transacao(async (banco) => {
      // Verifica os IDs usados como chaves estrangeiras antes do INSERT.
      await verificarCategoriaEUnidade(banco, dados.categoria_id, dados.unidade_medida_id);
      // Insere o produto; RETURNING id devolve o identificador gerado pelo PostgreSQL.
      const resultado = await banco.query(`INSERT INTO produto
        (sku, nome, descricao, categoria_id, unidade_medida_id, preco, estoque)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      // Cada valor desta lista corresponde, na ordem, a $1 ... $7 da consulta.
      [dados.sku, dados.nome, dados.descricao ?? null, dados.categoria_id,
        dados.unidade_medida_id, dados.preco, dados.estoque]);

      // Usa o ID recém-criado para ligar o produto ao seu primeiro registro de preço.
      const id = resultado.rows[0].id;
      // O histórico começa com vigencia_inicio padrão; usuario_id pode ser null.
      await banco.query(`INSERT INTO produto_preco_historico
        (produto_id, preco, motivo, usuario_id) VALUES ($1, $2, $3, $4)`,
      [id, dados.preco, 'Cadastro inicial', dados.usuario_id ?? null]);
      // Lê o produto antes de confirmar para devolver a mesma estrutura das consultas GET.
      return buscarProduto(id, banco);
    });

    // HTTP 201 indica que o cadastro foi criado com sucesso.
    return reply.code(201).send(produto);
  });

  // GET lista produtos e aplica filtros opcionais com paginação.
  app.get('/api/produtos', async (request) => {
    // Converte e valida os parâmetros da URL, como ?pagina=2&limite=20.
    const filtro = listaProdutosSchema.parse(request.query);
    // condicoes guarda partes do WHERE; valores guarda os dados dos placeholders SQL.
    const condicoes = [];
    const valores = [];

    // ILIKE procura trechos sem diferenciar maiúsculas e minúsculas.
    if (filtro.nome) { valores.push(`%${filtro.nome}%`); condicoes.push(`p.nome ILIKE $${valores.length}`); }
    // O número do placeholder sempre acompanha a posição do valor no array.
    if (filtro.sku) { valores.push(`%${filtro.sku}%`); condicoes.push(`p.sku ILIKE $${valores.length}`); }
    // Filtra pela categoria selecionada.
    if (filtro.categoria_id) { valores.push(filtro.categoria_id); condicoes.push(`p.categoria_id = $${valores.length}`); }
    // A situação textual vira o booleano salvo em produto.ativo.
    if (filtro.situacao) { valores.push(filtro.situacao === 'ativo'); condicoes.push(`p.ativo = $${valores.length}`); }

    // Monta WHERE apenas quando existe ao menos um filtro.
    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
    // Conta todos os produtos encontrados, antes de aplicar o limite da página.
    const total = await pool.query(`SELECT count(*)::int AS total FROM produto p ${where}`, valores);
    // limite é a quantidade de itens por página.
    const limite = filtro.limite;
    // offset pula os itens das páginas anteriores.
    const offset = (filtro.pagina - 1) * limite;
    // Executa a busca com ORDER BY fixo para manter a paginação previsível.
    const produtos = await pool.query(`${consultaProduto} ${where} ORDER BY p.id
      LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`, [...valores, limite, offset]);

    // Devolve itens e metadados para o cliente montar os controles de página.
    return { dados: produtos.rows.map(aplicarEstado), pagina: filtro.pagina, limite, total: total.rows[0].total };
  });

  // POST em /lote recebe { ids: [...] } e consulta vários produtos de uma vez.
  app.post('/api/produtos/lote', async (request) => {
    // Aceita de 1 a 100 números inteiros positivos.
    const { ids } = idsSchema.parse(request.body);
    // ANY compara p.id com cada ID do array enviado ao PostgreSQL.
    const resultado = await pool.query(`${consultaProduto} WHERE p.id = ANY($1::int[]) ORDER BY p.id`, [ids]);
    // IDs inexistentes simplesmente não aparecem na lista de resultados.
    return { dados: resultado.rows.map(aplicarEstado) };
  });

  // GET por ID devolve um produto específico.
  app.get('/api/produtos/:id', async (request) => {
    // idDaRota converte e valida o trecho :id da URL.
    const produto = await buscarProduto(idDaRota(request));
    // Responde 404 quando a consulta não encontra esse ID.
    if (!produto) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
    // O Fastify transforma o objeto retornado em JSON.
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
    return transacao(async (banco) => {
      // FOR UPDATE impede outra alteração do mesmo produto até esta terminar.
      const resultado = await banco.query('SELECT * FROM produto WHERE id = $1 FOR UPDATE', [id]);
      // rows[0] é o estado atual salvo no banco.
      const atual = resultado.rows[0];
      // Não é possível alterar um produto inexistente.
      if (!atual) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');

      // Se o cliente não enviou uma nova relação, preserva o ID atual.
      const categoriaId = dados.categoria_id ?? atual.categoria_id;
      const unidadeId = dados.unidade_medida_id ?? atual.unidade_medida_id;
      // Confere se a categoria continua ativa e se a unidade existe.
      await verificarCategoriaEUnidade(banco, categoriaId, unidadeId);

      // Sobrepõe os campos enviados aos valores antigos; os demais ficam como estavam.
      const novo = { ...atual, ...dados };
      // A lista após a SQL mantém a mesma ordem dos placeholders $1 a $7.
      await banco.query(`UPDATE produto SET nome=$1, descricao=$2, categoria_id=$3,
        unidade_medida_id=$4, preco=$5, estoque=$6, atualizado_em=now() WHERE id=$7`,
      [novo.nome, novo.descricao, categoriaId, unidadeId, novo.preco, novo.estoque, id]);

      // O histórico só muda quando o valor do preço realmente mudou.
      if (Number(novo.preco) !== Number(atual.preco)) {
        // Usa o mesmo instante para encerrar a vigência antiga e iniciar a nova.
        const inicio = new Date();
        // Encerra o registro que ainda não possui vigencia_fim.
        await banco.query(`UPDATE produto_preco_historico SET vigencia_fim=$2
          WHERE produto_id=$1 AND vigencia_fim IS NULL`, [id, inicio]);
        // Abre o novo registro com preço, motivo e usuário informado, se houver.
        await banco.query(`INSERT INTO produto_preco_historico
          (produto_id, preco, vigencia_inicio, motivo, usuario_id) VALUES ($1, $2, $3, $4, $5)`,
        [id, novo.preco, inicio, dados.motivo ?? null, dados.usuario_id ?? null]);
      }
      // Retorna o estado já atualizado usando a mesma conexão da transação.
      return buscarProduto(id, banco);
    });
  });

  // DELETE faz exclusão lógica: mantém a linha e marca ativo=false.
  app.delete('/api/produtos/:id', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Somente o gestor passa pelo preHandler acima.
    const id = idDaRota(request);
    // Atualiza a data da última alteração junto com o estado.
    const resultado = await pool.query('UPDATE produto SET ativo=false, atualizado_em=now() WHERE id=$1', [id]);
    // UPDATE sem linha afetada significa produto inexistente.
    if (!resultado.rowCount) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
    // Devolve o produto para o cliente ver ativo=false e situacao=inativo.
    return buscarProduto(id);
  });

  // Esta rota desfaz a inativação de um produto.
  app.post('/api/produtos/:id/reativar', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Valida o identificador antes da consulta SQL.
    const id = idDaRota(request);
    // Só reativa se a categoria do produto também estiver ativa.
    const resultado = await pool.query(`UPDATE produto p SET ativo=true, atualizado_em=now()
      FROM categoria c WHERE p.id=$1 AND c.id=p.categoria_id AND c.ativo=true`, [id]);
    // Sem linha alterada, o produto não existe ou a categoria está inativa.
    if (!resultado.rowCount) throw new ApiError(409, 'REATIVACAO_INDISPONIVEL', 'Produto inexistente ou categoria inativa');
    // Busca novamente para devolver todos os campos atualizados.
    return buscarProduto(id);
  });

  // Consulta todas as vigências de preço; a chave de gestor protege essa informação.
  app.get('/api/produtos/:id/historico-precos', { preHandler: exigirPerfil(['gestor']) }, async (request) => {
    // Converte o parâmetro da URL para um ID numérico válido.
    const id = idDaRota(request);
    // Primeiro confirma que o produto existe.
    if (!await buscarProduto(id)) throw new ApiError(404, 'PRODUTO_NAO_ENCONTRADO', 'Produto não encontrado');
    // Traz os preços do mais recente ao mais antigo.
    const resultado = await pool.query(`SELECT * FROM produto_preco_historico
      WHERE produto_id=$1 ORDER BY vigencia_inicio DESC, id DESC`, [id]);
    // numeric chega do pg como texto; Number prepara preco para o JSON.
    return { dados: resultado.rows.map((linha) => ({ ...linha, preco: Number(linha.preco) })) };
  });
}
