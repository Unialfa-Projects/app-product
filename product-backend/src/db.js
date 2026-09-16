import pg from 'pg';
import 'dotenv/config';

const configuracao = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  };

export const pool = new pg.Pool({ ...configuracao, connectionTimeoutMillis: 3000 });

// Usa a mesma conexão do início ao fim da operação. Se algo falhar, desfaz tudo.
export async function transacao(operacao) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await operacao(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
}

