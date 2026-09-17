// Implementação concreta da conexão de banco, usando PostgreSQL.
// Esta é a ÚNICA classe do projeto que sabe que o banco é o Postgres.
import pg from 'pg';
import { DatabaseConnection } from './DatabaseConnection.js';
import { env } from '../config/env.js';

export class PostgresConnection extends DatabaseConnection {
  constructor() {
    super();
    // DATABASE_URL (quando existir) já traz host, porta, usuário e senha
    // juntos; caso contrário, monta a configuração a partir dos campos
    // separados. Em nenhum dos dois casos a senha aparece no código: ela
    // sempre vem do arquivo .env através de src/config/env.js.
    const configuracao = env.database.url
      ? { connectionString: env.database.url }
      : {
        host: env.database.host,
        port: env.database.porta,
        database: env.database.nome,
        user: env.database.usuario,
        password: env.database.senha,
      };

    // O pool mantém várias conexões abertas e prontas para uso, reduzindo o
    // tempo gasto abrindo e fechando conexão a cada consulta.
    this.pool = new pg.Pool({ ...configuracao, connectionTimeoutMillis: 3000 });
  }

  async query(sql, valores) {
    return this.pool.query(sql, valores);
  }

  async obterCliente() {
    return this.pool.connect();
  }

  // Usa a mesma conexão do início ao fim da operação. Se algo falhar, desfaz tudo.
  async transacao(operacao) {
    const cliente = await this.obterCliente();
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

  async encerrar() {
    await this.pool.end();
  }
}
