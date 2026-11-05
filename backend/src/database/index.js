// Ponto único de acesso ao banco de dados usado pelo resto da aplicação.
//
// PARA TROCAR DE BANCO DE DADOS NO FUTURO:
// 1. Crie uma nova classe em src/database (ex.: MySqlConnection.js) que
//    estenda DatabaseConnection e implemente query, obterCliente,
//    transacao e encerrar, do jeito daquele banco.
// 2. Troque a linha abaixo para usar a classe nova.
// Nenhum outro arquivo do projeto (models, repositories, controllers)
// precisa mudar, porque todos eles conversam apenas com "db".
import { PostgresConnection } from './PostgresConnection.js';

export const db = new PostgresConnection();

export { DatabaseConnection } from './DatabaseConnection.js';
