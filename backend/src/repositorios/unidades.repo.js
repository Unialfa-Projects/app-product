import { pool } from '../config/db.js';

export async function listar({ situacao = 'todos' } = {}) {
  const condicoes = [];
  if (situacao === 'ativo') condicoes.push('ativo = TRUE');
  if (situacao === 'inativo') condicoes.push('ativo = FALSE');
  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT id, nome, sigla, descricao, casas_decimais, ativo
       FROM unidade_medida ${where}
      ORDER BY nome`
  );
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nome, sigla, descricao, casas_decimais, ativo FROM unidade_medida WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function buscarPorSigla(sigla, ignorarId = null) {
  const parametros = [sigla];
  let query = `SELECT id, nome, sigla FROM unidade_medida WHERE sigla = $1`;
  if (ignorarId) {
    parametros.push(ignorarId);
    query += ` AND id <> $2`;
  }
  const { rows } = await pool.query(query, parametros);
  return rows[0] ?? null;
}

export async function inserir({ nome, sigla, descricao, casas_decimais }) {
  const { rows } = await pool.query(
    `INSERT INTO unidade_medida (nome, sigla, descricao, casas_decimais)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nome, sigla, descricao, casas_decimais, ativo`,
    [nome, sigla, descricao ?? null, casas_decimais ?? 0]
  );
  return rows[0];
}

export async function atualizar(id, campos) {
  const colunas = Object.keys(campos);
  if (colunas.length === 0) return buscarPorId(id);

  const sets = colunas.map((coluna, indice) => `${coluna} = $${indice + 2}`).join(', ');
  const valores = colunas.map((coluna) => campos[coluna]);

  const { rows } = await pool.query(
    `UPDATE unidade_medida SET ${sets} WHERE id = $1
     RETURNING id, nome, sigla, descricao, casas_decimais, ativo`,
    [id, ...valores]
  );
  return rows[0] ?? null;
}
