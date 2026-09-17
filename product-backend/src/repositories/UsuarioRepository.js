// Repository = a única camada que sabe escrever SQL para a tabela "usuario".
import { Usuario } from '../models/Usuario.js';

export class UsuarioRepository {
  constructor(banco) {
    this.banco = banco;
  }

  async criar({ nome, email, senha }, executor = this.banco) {
    const resultado = await executor.query(
      'INSERT INTO usuario (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, senha],
    );
    return new Usuario(resultado.rows[0]);
  }

  // Comparação direta, sem hash: é a verificação simples pedida para este projeto.
  async buscarPorEmailESenha(email, senha, executor = this.banco) {
    const resultado = await executor.query(
      'SELECT * FROM usuario WHERE email = $1 AND senha = $2',
      [email, senha],
    );
    return resultado.rows[0] ? new Usuario(resultado.rows[0]) : null;
  }
}
