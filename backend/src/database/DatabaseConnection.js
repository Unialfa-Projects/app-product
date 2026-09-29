// Classe abstrata: ela descreve O QUE toda conexão de banco de dados precisa
// saber fazer, mas não sabe COMO fazer. Quem sabe "como" é uma classe filha,
// como PostgresConnection.js.
//
// Por que isso ajuda a trocar de banco no futuro?
// Hoje o projeto usa PostgreSQL (PostgresConnection). Se um dia for preciso
// usar outro banco (MySQL, SQLite, etc.), basta criar uma nova classe, por
// exemplo "MySqlConnection extends DatabaseConnection", implementando estes
// mesmos quatro métodos. Nenhum Model, Repository ou Controller precisa mudar,
// porque eles só conhecem esta classe abstrata, nunca o banco por trás dela.
export class DatabaseConnection {
  constructor() {
    // Impede que alguém crie "new DatabaseConnection()" diretamente: ela só
    // existe para ser estendida por uma classe concreta.
    if (new.target === DatabaseConnection) {
      throw new Error(
        'DatabaseConnection é abstrata. Crie uma classe filha (ex.: PostgresConnection) e a estenda.',
      );
    }
  }

  // Executa uma consulta SQL simples e devolve o resultado.
  // "valores" é a lista de parâmetros que substitui $1, $2, ... na consulta.
  async query(_sql, _valores) {
    throw new Error('O método "query" precisa ser implementado pela classe filha.');
  }

  // Reserva uma conexão exclusiva do banco, usada quando várias consultas
  // precisam acontecer em sequência como se fossem uma coisa só (transação).
  async obterCliente() {
    throw new Error('O método "obterCliente" precisa ser implementado pela classe filha.');
  }

  // Executa "operacao" dentro de uma transação: se tudo der certo, confirma
  // (COMMIT); se algo falhar no meio do caminho, desfaz tudo (ROLLBACK).
  async transacao(_operacao) {
    throw new Error('O método "transacao" precisa ser implementado pela classe filha.');
  }

  // Fecha todas as conexões abertas. Usado ao encerrar a aplicação ou os testes.
  async encerrar() {
    throw new Error('O método "encerrar" precisa ser implementado pela classe filha.');
  }
}
