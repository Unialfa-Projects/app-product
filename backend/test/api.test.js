import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { db } from '../src/database/index.js';

process.env.OPERADOR_API_KEY = 'operador_teste';
process.env.GESTOR_API_KEY = 'gestor_teste';

async function requisitar(opcoes) {
  const app = createApp();
  try {
    await app.ready();
    return await app.inject(opcoes);
  } finally {
    await app.close();
  }
}

test('escrita exige uma chave de API', async () => {
  const resposta = await requisitar({ method: 'POST', url: '/api/produtos', payload: {} });
  assert.equal(resposta.statusCode, 401);
  assert.equal(resposta.json().codigo, 'NAO_AUTORIZADO');
});

test('validação usa os limites do diagrama UML', async () => {
  const resposta = await requisitar({ method: 'POST', url: '/api/produtos',
    headers: { authorization: 'Bearer operador_teste' },
    payload: { sku: '1234567890123456', nome: 'Teste', categoria_id: 1,
      unidade_medida_id: 1, preco: 0, estoque: 0 },
  });
  assert.equal(resposta.statusCode, 422);
  const campos = resposta.json().detalhes.map((item) => item.path[0]);
  assert.ok(campos.includes('sku'));
  assert.ok(campos.includes('preco'));
});

test('identificador inválido retorna 400', async () => {
  const resposta = await requisitar({ method: 'GET', url: '/api/produtos/abc' });
  assert.equal(resposta.statusCode, 400);
  assert.equal(resposta.json().codigo, 'ID_INVALIDO');
});

test('OpenAPI descreve os campos preço e estoque', async () => {
  const resposta = await requisitar({ method: 'GET', url: '/docs/json' });
  assert.equal(resposta.statusCode, 200);
  const esquema = resposta.json().components.schemas.ProdutoEntrada;
  assert.ok(esquema.properties.preco);
  assert.ok(esquema.properties.estoque);
  assert.equal(esquema.properties.sku.maxLength, 15);
});

test('cadastro grava produto e preço inicial na mesma transação', async () => {
  const chamadas = [];
  const conectarOriginal = db.pool.connect;
  db.pool.connect = async () => ({
    query: async (sql, valores = []) => {
      chamadas.push({ sql, valores });
      if (sql.includes('SELECT id FROM categoria')) return { rowCount: 1 };
      if (sql.includes('SELECT id FROM unidade_medida')) return { rowCount: 1 };
      if (sql.includes('INSERT INTO produto\n')) return { rows: [{ id: 1 }] };
      if (sql.includes('FROM produto p')) return { rows: [{ id: 1, nome: 'Teste', sku: 'T1', ativo: true,
        preco: '10.00', estoque: '2.500', unidade: 'UN' }] };
      return { rowCount: 1, rows: [] };
    },
    release: () => {},
  });
  try {
    const resposta = await requisitar({ method: 'POST', url: '/api/produtos',
      headers: { authorization: 'Bearer operador_teste' },
      payload: { sku: 'T1', nome: 'Teste', categoria_id: 1, unidade_medida_id: 1,
        preco: 10, estoque: 2.5 },
    });
    assert.equal(resposta.statusCode, 201);
    assert.equal(resposta.json().estoque, 2.5);
    assert.ok(chamadas.some(({ sql }) => sql.includes('INSERT INTO produto_preco_historico')));
    assert.ok(chamadas.some(({ sql }) => sql === 'COMMIT'));
  } finally {
    db.pool.connect = conectarOriginal;
  }
});

test('operador não pode alterar preço', async () => {
  const resposta = await requisitar({ method: 'PUT', url: '/api/produtos/1',
    headers: { authorization: 'Bearer operador_teste' }, payload: { preco: 20 },
  });
  assert.equal(resposta.statusCode, 403);
});

test('cadastro de usuário valida email e senha', async () => {
  const resposta = await requisitar({ method: 'POST', url: '/api/usuarios',
    payload: { nome: 'Ana', email: 'nao-e-email', senha: '123' },
  });
  assert.equal(resposta.statusCode, 422);
  const campos = resposta.json().detalhes.map((item) => item.path[0]);
  assert.ok(campos.includes('email'));
  assert.ok(campos.includes('senha'));
});

test('cadastro de usuário não exige chave de API', async () => {
  const consultaOriginal = db.query;
  db.query = async (sql, valores = []) => {
    if (sql.includes('INSERT INTO usuario')) {
      return { rows: [{ id: 1, nome: valores[0], email: valores[1], criado_em: '2026-01-01', atualizado_em: '2026-01-01' }] };
    }
    return { rowCount: 0, rows: [] };
  };
  try {
    const resposta = await requisitar({ method: 'POST', url: '/api/usuarios',
      payload: { nome: 'Ana Silva', email: 'Ana@Exemplo.com', senha: 'senha123' },
    });
    assert.equal(resposta.statusCode, 201);
    // o email deve ser normalizado para minúsculo antes de ir para o banco.
    assert.equal(resposta.json().email, 'ana@exemplo.com');
    // a senha nunca deve aparecer na resposta.
    assert.equal(resposta.json().senha, undefined);
  } finally {
    db.query = consultaOriginal;
  }
});

test('login com credenciais inválidas retorna 401', async () => {
  const consultaOriginal = db.query;
  db.query = async () => ({ rows: [] });
  try {
    const resposta = await requisitar({ method: 'POST', url: '/api/usuarios/login',
      payload: { email: 'ana@exemplo.com', senha: 'errada' },
    });
    assert.equal(resposta.statusCode, 401);
    assert.equal(resposta.json().codigo, 'CREDENCIAIS_INVALIDAS');
  } finally {
    db.query = consultaOriginal;
  }
});

test('login com credenciais corretas devolve o id do usuário, sem token', async () => {
  const consultaOriginal = db.query;
  db.query = async () => ({ rows: [{ id: 7, nome: 'Ana Silva', email: 'ana@exemplo.com', criado_em: '2026-01-01', atualizado_em: '2026-01-01' }] });
  try {
    const resposta = await requisitar({ method: 'POST', url: '/api/usuarios/login',
      payload: { email: 'ana@exemplo.com', senha: 'senha123' },
    });
    assert.equal(resposta.statusCode, 200);
    assert.equal(resposta.json().id, 7);
    assert.equal(resposta.json().token, undefined);
  } finally {
    db.query = consultaOriginal;
  }
});

test('gestor fecha a vigência anterior ao alterar preço', async () => {
  const chamadas = [];
  const conectarOriginal = db.pool.connect;
  db.pool.connect = async () => ({
    query: async (sql, valores = []) => {
      chamadas.push({ sql, valores });
      if (sql.includes('SELECT * FROM produto')) return { rows: [{ id: 1, nome: 'Teste', sku: 'T1', ativo: true,
        categoria_id: 1, unidade_medida_id: 1, preco: '10.00', estoque: '2.500' }] };
      if (sql.includes('SELECT id FROM categoria') || sql.includes('SELECT id FROM unidade_medida')) return { rowCount: 1 };
      if (sql.includes('FROM produto p')) return { rows: [{ id: 1, nome: 'Teste', sku: 'T1', ativo: true,
        preco: '20.00', estoque: '2.500', unidade: 'UN' }] };
      return { rowCount: 1, rows: [] };
    },
    release: () => {},
  });
  try {
    const resposta = await requisitar({ method: 'PUT', url: '/api/produtos/1',
      headers: { authorization: 'Bearer gestor_teste' }, payload: { preco: 20, motivo: 'Reajuste' },
    });
    assert.equal(resposta.statusCode, 200);
    assert.ok(chamadas.some(({ sql }) => sql.includes('SET vigencia_fim')));
    const registro = chamadas.find(({ sql }) => sql.includes('INSERT INTO produto_preco_historico'));
    assert.equal(registro.valores[1], 20);
    assert.equal(registro.valores[3], 'Reajuste');
    assert.ok(chamadas.some(({ sql }) => sql === 'COMMIT'));
  } finally {
    db.pool.connect = conectarOriginal;
  }
});
