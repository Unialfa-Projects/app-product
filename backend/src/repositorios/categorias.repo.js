import { pool } from '../config/db.js';

export async function listar({ situacao = 'todos' } = {}) {
  const condicoes = [];
  const parametros = [];

  if (situacao === 'ativo') condicoes.push('c.ativo = TRUE');
  if (situacao === 'inativo') condicoes.push('c.ativo = FALSE');

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT c.id, c.nome, c.categoria_pai_id, c.ativo,
            p.nome AS categoria_pai_nome
       FROM categoria c
       LEFT JOIN categoria p ON p.id = c.categoria_pai_id
       ${where}
      ORDER BY c.nome`,
    parametros
  );
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nome, categoria_pai_id, ativo FROM categoria WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function buscarPorNome(nome) {
  const { rows } = await pool.query(
    `SELECT id, nome, categoria_pai_id, ativo FROM categoria WHERE nome = $1`,
    [nome]
  );
  return rows[0] ?? null;
}

export async function inserir({ nome, categoria_pai_id }) {
  const { rows } = await pool.query(
    `INSERT INTO categoria (nome, categoria_pai_id) VALUES ($1, $2)
     RETURNING id, nome, categoria_pai_id, ativo`,
    [nome, categoria_pai_id ?? null]
  );
  return rows[0];
}

export async function atualizar(id, campos) {
  const colunas = Object.keys(campos);
  if (colunas.length === 0) return buscarPorId(id);

  const sets = colunas.map((coluna, indice) => `${coluna} = $${indice + 2}`).join(', ');
  const valores = colunas.map((coluna) => campos[coluna]);

  const { rows } = await pool.query(
    `UPDATE categoria SET ${sets} WHERE id = $1
     RETURNING id, nome, categoria_pai_id, ativo`,
    [id, ...valores]
  );
  return rows[0] ?? null;
}

export async function contarProdutosAtivosVinculados(categoriaId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM produto WHERE categoria_id = $1 AND ativo = TRUE`,
    [categoriaId]
  );
  return rows[0].total;
}
