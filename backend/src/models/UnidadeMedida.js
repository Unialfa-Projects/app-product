// Model = a "ficha" de uma Unidade de Medida (ex.: unidade, quilo, litro).
export class UnidadeMedida {
  constructor(linha) {
    this.id = linha.id;
    this.nome = linha.nome;
    this.sigla = linha.sigla;
    this.descricao = linha.descricao;
    this.casasDecimais = linha.casas_decimais;
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      sigla: this.sigla,
      descricao: this.descricao,
      casas_decimais: this.casasDecimais,
    };
  }
}
