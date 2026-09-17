import { pool } from '../config/db.js';

// RN15: nenhum SELECT deste arquivo, exceto buscarPorEmailComSenha (uso interno do login),
// retorna a coluna senha para fora da camada de serviço.

export async function buscarPorEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, nome, email FROM usuario WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function buscarPorEmailComSenha(email) {
  const { rows } = await pool.query(
    `SELECT id, nome, email, senha FROM usuario WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nome, email FROM usuario WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function inserir({ nome, email, senha }) {
  const { rows } = await pool.query(
    `INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3)
     RETURNING id, nome, email`,
    [nome, email, senha]
  );
  return rows[0];
}
