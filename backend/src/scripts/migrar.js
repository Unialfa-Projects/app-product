import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASTA_MIGRATIONS = path.resolve(__dirname, '../../../database/migrations');

async function garantirTabelaControle(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      nome_arquivo VARCHAR(200) PRIMARY KEY,
      aplicado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function migrar() {
  const client = await pool.connect();
  try {
    await garantirTabelaControle(client);

    const arquivos = (await readdir(PASTA_MIGRATIONS))
      .filter((nome) => nome.endsWith('.sql'))
      .sort();

    const { rows: aplicadas } = await client.query('SELECT nome_arquivo FROM schema_migrations');
    const jaAplicadas = new Set(aplicadas.map((r) => r.nome_arquivo));

    for (const arquivo of arquivos) {
      if (jaAplicadas.has(arquivo)) {
        console.log(`[migrate] ${arquivo} — já aplicada, ignorando.`);
        continue;
      }
      const sql = await readFile(path.join(PASTA_MIGRATIONS, arquivo), 'utf-8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (nome_arquivo) VALUES ($1)', [arquivo]);
        await client.query('COMMIT');
        console.log(`[migrate] ${arquivo} — aplicada com sucesso.`);
      } catch (erro) {
        await client.query('ROLLBACK');
        throw new Error(`Falha ao aplicar ${arquivo}: ${erro.message}`);
      }
    }

    console.log('Migrações concluídas.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrar().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
