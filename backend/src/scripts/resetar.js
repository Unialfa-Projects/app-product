import { pool } from '../config/db.js';

const TABELAS = [
  'produto_preco_historico',
  'produto',
  'categoria',
  'unidade_medida',
  'usuario',
  'schema_migrations',
];

async function resetar() {
  const client = await pool.connect();
  try {
    await client.query(`DROP TABLE IF EXISTS ${TABELAS.join(', ')} CASCADE`);
    console.log('Banco de dados zerado. Rode "npm run db:migrate" e "npm run db:seed" em seguida.');
  } finally {
    client.release();
    await pool.end();
  }
}

resetar().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
