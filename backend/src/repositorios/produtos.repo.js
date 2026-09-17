import { pool } from '../config/db.js';

const SELECT_BASE = `
  SELECT p.id, p.sku, p.nome, p.descricao, p.ean13,
         p.preco_custo, p.preco_venda, p.estoque, p.ativo,
         p.criado_em, p.atualizado_em,
         c.id AS categoria_id, c.nome AS categoria_nome,
         cp.id AS categoria_pai_id, cp.nome AS categoria_pai_nome,
         u.id AS unidade_id, u.nome AS unidade_nome, u.sigla AS unidade_sigla
    FROM produto p
    JOIN categoria c ON c.id = p.categoria_id
    LEFT JOIN categoria cp ON cp.id = c.categoria_pai_id
    JOIN unidade_medida u ON u.id = p.unidade_medida_id
`;

function mapearLinha(r) {
  return {
    id: r.id,
    sku: r.sku,
    nome: r.nome,
    descricao: r.descricao,
    ean13: r.ean13,
    categoria: {
      id: r.categoria_id,
      nome: r.categoria_nome,
      categoria_pai: r.categoria_pai_id ? { id: r.categoria_pai_id, nome: r.categoria_pai_nome } : null,
    },
    unidade_medida: { id: r.unidade_id, nome: r.unidade_nome, sigla: r.unidade_sigla },
    preco_custo: Number(r.preco_custo),
    preco_venda: Number(r.preco_venda),
    estoque: Number(r.estoque),
    situacao: r.ativo ? 'ativo' : 'inativo', // RF25
    criado_em: r.criado_em,
    atualizado_em: r.atualizado_em,
  };
}

function montarFiltro({ nome, sku, categoria_id, situacao }) {
  const condicoes = [];
  const parametros = [];

  if (nome) {
    parametros.push(`%${nome}%`);
    condicoes.push(`p.nome ILIKE $${parametros.length}`);
  }
  if (sku) {
    parametros.push(`%${sku}%`);
    condicoes.push(`p.sku ILIKE $${parametros.length}`);
  }
  if (categoria_id) {
    parametros.push(categoria_id);
    condicoes.push(`p.categoria_id = $${parametros.length}`);
  }
  if (situacao === 'ativo') condicoes.push('p.ativo = TRUE');
  if (situacao === 'inativo') condicoes.push('p.ativo = FALSE');

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';
  return { where, parametros };
}

export async function listar(filtro) {
  const { where, parametros } = montarFiltro(filtro);
  const limite = filtro.limite;
  const offset = (filtro.pagina - 1) * filtro.limite;

  const { rows } = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY p.id DESC LIMIT $${parametros.length + 1} OFFSET $${parametros.length + 2}`,
    [...parametros, limite, offset]
  );

  const { rows: totalRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM produto p ${where}`,
    parametros
  );

  return { dados: rows.map(mapearLinha), total: totalRows[0].total };
}

export async function buscarPorId(id, client) {
  const executor = client ?? pool;
  const { rows } = await executor.query(`${SELECT_BASE} WHERE p.id = $1`, [id]);
  return rows[0] ? mapearLinha(rows[0]) : null;
}

export async function buscarPorSku(sku) {
  const { rows } = await pool.query(`SELECT id FROM produto WHERE sku = $1`, [sku]);
  return rows[0] ?? null;
}

export async function buscarPorEan13(ean13) {
  const { rows } = await pool.query(`SELECT id FROM produto WHERE ean13 = $1`, [ean13]);
  return rows[0] ?? null;
}

export async function buscarPorNomeCategoria(nome, categoriaId, ignorarId = null) {
  const parametros = [nome, categoriaId];
  let query = `SELECT id FROM produto WHERE nome = $1 AND categoria_id = $2`;
  if (ignorarId) {
    parametros.push(ignorarId);
    query += ` AND id <> $3`;
  }
  const { rows } = await pool.query(query, parametros);
  return rows[0] ?? null;
}

export async function inserir(client, dados) {
  const executor = client ?? pool;
  const { rows } = await executor.query(
    `INSERT INTO produto
       (sku, nome, descricao, ean13, categoria_id, unidade_medida_id,
        preco_custo, preco_venda, estoque, ativo)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      dados.sku, dados.nome, dados.descricao ?? null, dados.ean13 ?? null,
      dados.categoria_id, dados.unidade_medida_id,
      dados.preco_custo ?? 0, dados.preco_venda, dados.estoque ?? 0,
      dados.ativo ?? true,
    ]
  );
  return rows[0];
}

export async function atualizar(client, id, campos) {
  const executor = client ?? pool;
  const colunas = Object.keys(campos);
  if (colunas.length === 0) return buscarPorId(id);

  const sets = colunas.map((coluna, indice) => `${coluna} = $${indice + 2}`).join(', ');
  const valores = colunas.map((coluna) => campos[coluna]);

  await executor.query(`UPDATE produto SET ${sets} WHERE id = $1`, [id, ...valores]);
  return buscarPorId(id, client);
}

export async function alterarSituacao(id, ativo) {
  await pool.query(`UPDATE produto SET ativo = $2 WHERE id = $1`, [id, ativo]);
  return buscarPorId(id);
}

export async function excluirFisicamente(id) {
  await pool.query(`DELETE FROM produto WHERE id = $1`, [id]);
}
