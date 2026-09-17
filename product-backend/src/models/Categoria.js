// Model = a "ficha" de uma Categoria de produto.
export class Categoria {
  constructor(linha) {
    this.id = linha.id;
    this.nome = linha.nome;
    this.categoriaPaiId = linha.categoria_pai_id;
    this.ativo = linha.ativo;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      categoria_pai_id: this.categoriaPaiId,
      ativo: this.ativo,
    };
  }
}
