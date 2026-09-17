// Model = a "ficha" de um registro do histórico de preço de um produto.
// Cada linha representa um período (vigência) em que o produto teve um preço.
export class HistoricoPreco {
  constructor(linha) {
    this.id = linha.id;
    this.produtoId = linha.produto_id;
    this.preco = Number(linha.preco);
    this.vigenciaInicio = linha.vigencia_inicio;
    this.vigenciaFim = linha.vigencia_fim;
    this.motivo = linha.motivo;
    this.usuarioId = linha.usuario_id;
  }

  toJSON() {
    return {
      id: this.id,
      produto_id: this.produtoId,
      preco: this.preco,
      vigencia_inicio: this.vigenciaInicio,
      vigencia_fim: this.vigenciaFim,
      motivo: this.motivo,
      usuario_id: this.usuarioId,
    };
  }
}
