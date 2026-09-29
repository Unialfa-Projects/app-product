// Repository = a única camada que sabe escrever SQL para a tabela "produto".
// Controllers nunca falam com o banco diretamente: eles chamam estes métodos.
import { Produto } from '../models/Produto.js';

// Consulta reutilizada por vários métodos: traz o produto e nomes úteis das
// tabelas relacionadas (categoria e unidade de medida).
const SELECT_PRODUTO = `SELECT p.*, c.nome AS categoria, u.sigla AS unidade
  FROM produto p
  JOIN categoria c ON c.id = p.categoria_id
  JOIN unidade_medida u ON u.id = p.unidade_medida_id`;

// Monta a cláusula WHERE dos filtros de listagem (nome, sku, categoria, situação).
function montarFiltro(filtro) {
  const condicoes = [];
  const valores = [];

  if (filtro.nome) { valores.push(`%${filtro.nome}%`); condicoes.push(`p.nome ILIKE $${valores.length}`); }
  if (filtro.sku) { valores.push(`%${filtro.sku}%`); condicoes.push(`p.sku ILIKE $${valores.length}`); }
  if (filtro.categoria_id) { valores.push(filtro.categoria_id); condicoes.push(`p.categoria_id = $${valores.length}`); }
  if (filtro.situacao) { valores.push(filtro.situacao === 'ativo'); condicoes.push(`p.ativo = $${valores.length}`); }

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  return { where, valores };
}

export class ProdutoRepository {
  // "banco" é sempre um objeto com um método .query(sql, valores) — tanto o
  // "db" (pool de conexões) quanto o "cliente" de uma transação servem aqui.
  constructor(banco) {
    this.banco = banco;
  }

  // Busca um único produto pelo ID. "executor" permite usar a mesma conexão
  // de uma transação em andamento; sem informar, usa o pool padrão.
  async buscarPorId(id, executor = this.banco) {
    const resultado = await executor.query(`${SELECT_PRODUTO} WHERE p.id = $1`, [id]);
    return resultado.rows[0] ? new Produto(resultado.rows[0]) : null;
  }

  async buscarPorIds(ids, executor = this.banco) {
    const resultado = await executor.query(`${SELECT_PRODUTO} WHERE p.id = ANY($1::int[]) ORDER BY p.id`, [ids]);
    return resultado.rows.map((linha) => new Produto(linha));
  }

  async contar(filtro, executor = this.banco) {
    const { where, valores } = montarFiltro(filtro);
    const resultado = await executor.query(`SELECT count(*)::int AS total FROM produto p ${where}`, valores);
    return resultado.rows[0].total;
  }

  async listar(filtro, executor = this.banco) {
    const { where, valores } = montarFiltro(filtro);
    const limite = filtro.limite;
    const offset = (filtro.pagina - 1) * limite;
    const resultado = await executor.query(`${SELECT_PRODUTO} ${where} ORDER BY p.id
      LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`, [...valores, limite, offset]);
    return resultado.rows.map((linha) => new Produto(linha));
  }

  // Cria o produto e devolve apenas o ID gerado pelo banco.
  async criar(dados, executor) {
    const resultado = await executor.query(`INSERT INTO produto
      (sku, nome, descricao, categoria_id, unidade_medida_id, preco, estoque)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [dados.sku, dados.nome, dados.descricao ?? null, dados.categoriaId,
      dados.unidadeMedidaId, dados.preco, dados.estoque]);
    return resultado.rows[0].id;
  }

  // Bloqueia a linha (FOR UPDATE) para impedir alteração simultânea durante
  // uma transação. Devolve a linha "crua" do banco, sem transformar em Model,
  // porque o Controller ainda precisa comparar/mesclar estes valores antigos.
  async bloquearPorId(id, executor) {
    const resultado = await executor.query('SELECT * FROM produto WHERE id = $1 FOR UPDATE', [id]);
    return resultado.rows[0] ?? null;
  }

  async atualizar(id, dados, executor) {
    await executor.query(`UPDATE produto SET nome=$1, descricao=$2, categoria_id=$3,
      unidade_medida_id=$4, preco=$5, estoque=$6, atualizado_em=now() WHERE id=$7`,
    [dados.nome, dados.descricao, dados.categoriaId, dados.unidadeMedidaId, dados.preco, dados.estoque, id]);
  }

  // Exclusão lógica: mantém a linha e apenas marca ativo=false.
  async inativar(id, executor = this.banco) {
    const resultado = await executor.query('UPDATE produto SET ativo=false, atualizado_em=now() WHERE id=$1', [id]);
    return resultado.rowCount > 0;
  }

  // Só reativa se a categoria do produto também estiver ativa.
  async reativarSeCategoriaAtiva(id, executor = this.banco) {
    const resultado = await executor.query(`UPDATE produto p SET ativo=true, atualizado_em=now()
      FROM categoria c WHERE p.id=$1 AND c.id=p.categoria_id AND c.ativo=true`, [id]);
    return resultado.rowCount > 0;
  }
}
