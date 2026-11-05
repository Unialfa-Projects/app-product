// Model = a "ficha" de um Produto. Descreve os campos que um produto tem e
// como ele deve aparecer quando a API responde em JSON. Não sabe nada sobre
// HTTP nem sobre SQL — isso é trabalho do Controller e do Repository.
export class Produto {
  constructor(linha) {
    this.id = linha.id;
    this.sku = linha.sku;
    this.nome = linha.nome;
    this.descricao = linha.descricao;
    this.categoriaId = linha.categoria_id;
    this.unidadeMedidaId = linha.unidade_medida_id;
    // O PostgreSQL devolve campos "numeric" como texto (ex: "10.00");
    // Number() converte para número de verdade antes de ir para o JSON.
    this.preco = linha.preco === undefined ? undefined : Number(linha.preco);
    this.estoque = linha.estoque === undefined ? undefined : Number(linha.estoque);
    this.ativo = linha.ativo;
    this.criadoEm = linha.criado_em;
    this.atualizadoEm = linha.atualizado_em;
    // Nomes trazidos pelo JOIN com categoria e unidade_medida, quando presentes.
    this.categoria = linha.categoria;
    this.unidade = linha.unidade;
  }

  // "ativo" é o dado guardado no banco; "situacao" é o texto que a API expõe.
  get situacao() {
    return this.ativo ? 'ativo' : 'inativo';
  }

  // JSON.stringify chama este método sozinho, então basta devolver o Model
  // na resposta da rota (reply.send(produto)) que o formato certo é gerado.
  toJSON() {
    return {
      id: this.id,
      sku: this.sku,
      nome: this.nome,
      descricao: this.descricao,
      categoria_id: this.categoriaId,
      unidade_medida_id: this.unidadeMedidaId,
      categoria: this.categoria,
      unidade: this.unidade,
      preco: this.preco,
      estoque: this.estoque,
      ativo: this.ativo,
      situacao: this.situacao,
      criado_em: this.criadoEm,
      atualizado_em: this.atualizadoEm,
    };
  }
}
