// Repository = a única camada que sabe escrever SQL para "unidade_medida".
import { UnidadeMedida } from '../models/UnidadeMedida.js';

export class UnidadeMedidaRepository {
  constructor(banco) {
    this.banco = banco;
  }

  async criar({ nome, sigla, descricao, casasDecimais }, executor = this.banco) {
    const resultado = await executor.query(`INSERT INTO unidade_medida
      (nome, sigla, descricao, casas_decimais) VALUES ($1, $2, $3, $4) RETURNING *`,
    [nome, sigla, descricao ?? null, casasDecimais]);
    return new UnidadeMedida(resultado.rows[0]);
  }

  async listarTodas(executor = this.banco) {
    const resultado = await executor.query('SELECT * FROM unidade_medida ORDER BY nome');
    return resultado.rows.map((linha) => new UnidadeMedida(linha));
  }

  async existePorId(id, executor = this.banco) {
    const resultado = await executor.query('SELECT id FROM unidade_medida WHERE id = $1', [id]);
    return resultado.rowCount > 0;
  }
}
