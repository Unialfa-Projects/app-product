// Repository = a única camada que sabe escrever SQL para
// "produto_preco_historico" (as vigências de preço de cada produto).
import { HistoricoPreco } from '../models/HistoricoPreco.js';

export class HistoricoPrecoRepository {
  constructor(banco) {
    this.banco = banco;
  }

  // Primeiro registro de preço de um produto recém-cadastrado.
  async abrirRegistroInicial({ produtoId, preco, usuarioId }, executor) {
    await executor.query(`INSERT INTO produto_preco_historico
      (produto_id, preco, motivo, usuario_id) VALUES ($1, $2, $3, $4)`,
    [produtoId, preco, 'Cadastro inicial', usuarioId ?? null]);
  }

  // Fecha a vigência que ainda está aberta (vigencia_fim IS NULL).
  async encerrarVigenciaAtual(produtoId, dataFim, executor) {
    await executor.query(`UPDATE produto_preco_historico SET vigencia_fim=$2
      WHERE produto_id=$1 AND vigencia_fim IS NULL`, [produtoId, dataFim]);
  }

  // Abre a vigência seguinte, com o novo preço.
  async abrirNovaVigencia({ produtoId, preco, inicio, motivo, usuarioId }, executor) {
    await executor.query(`INSERT INTO produto_preco_historico
      (produto_id, preco, vigencia_inicio, motivo, usuario_id) VALUES ($1, $2, $3, $4, $5)`,
    [produtoId, preco, inicio, motivo ?? null, usuarioId ?? null]);
  }

  async listarPorProduto(produtoId, executor = this.banco) {
    const resultado = await executor.query(`SELECT * FROM produto_preco_historico
      WHERE produto_id=$1 ORDER BY vigencia_inicio DESC, id DESC`, [produtoId]);
    return resultado.rows.map((linha) => new HistoricoPreco(linha));
  }
}
