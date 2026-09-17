// Model = a "ficha" de um Usuário.
export class Usuario {
  constructor(linha) {
    this.id = linha.id;
    this.nome = linha.nome;
    this.email = linha.email;
    this.criadoEm = linha.criado_em;
    this.atualizadoEm = linha.atualizado_em;
  }

  // A senha nunca aparece aqui de propósito: mesmo sem hash, ela não deve
  // voltar em nenhuma resposta da API (nem no cadastro, nem no login).
  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      criado_em: this.criadoEm,
      atualizado_em: this.atualizadoEm,
    };
  }
}
