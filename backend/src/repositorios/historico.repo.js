import { pool } from '../config/db.js';

export async function inserir(client, { produto_id, tipo_preco, valor_anterior, valor_novo, motivo, usuario_id }) {
  const executor = client ?? pool;
  const { rows } = await executor.query(
    `INSERT INTO produto_preco_historico
       (produto_id, tipo_preco, valor_anterior, valor_novo, motivo, usuario_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [produto_id, tipo_preco, valor_anterior ?? null, valor_novo, motivo ?? null, usuario_id ?? null]
  );
  return rows[0];
}

export async function listarPorProduto(produtoId) {
  const { rows } = await pool.query(
    `SELECT h.id, h.tipo_preco, h.valor_anterior, h.valor_novo, h.vigencia_inicio, h.motivo,
            u.id AS usuario_id, u.nome AS usuario_nome
       FROM produto_preco_historico h
       LEFT JOIN usuario u ON u.id = h.usuario_id
      WHERE h.produto_id = $1
      ORDER BY h.vigencia_inicio DESC`,
    [produtoId]
  );
  return rows.map((r) => ({
    id: r.id,
    tipo_preco: r.tipo_preco,
    valor_anterior: r.valor_anterior !== null ? Number(r.valor_anterior) : null,
    valor_novo: Number(r.valor_novo),
    vigencia_inicio: r.vigencia_inicio,
    motivo: r.motivo,
    usuario: r.usuario_id ? { id: r.usuario_id, nome: r.usuario_nome } : null,
  }));
}

export async function existeHistoricoParaProduto(produtoId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM produto_preco_historico WHERE produto_id = $1 LIMIT 1`,
    [produtoId]
  );
  return rows.length > 0;
}
