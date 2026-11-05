import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASTA_SEED = path.resolve(__dirname, '../../../database/seed');

async function semear() {
  const client = await pool.connect();
  try {
    const arquivos = (await readdir(PASTA_SEED))
      .filter((nome) => nome.endsWith('.sql'))
      .sort();

    for (const arquivo of arquivos) {
      const sql = await readFile(path.join(PASTA_SEED, arquivo), 'utf-8');
      await client.query(sql);
      console.log(`[seed] ${arquivo} — executado.`);
    }

    console.log('Seed concluído.');
  } finally {
    client.release();
    await pool.end();
  }
}

semear().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
