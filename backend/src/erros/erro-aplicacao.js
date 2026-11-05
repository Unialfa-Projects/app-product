import { CODIGOS_ERRO } from './codigos.js';

export class ErroAplicacao extends Error {
  constructor(codigo, detalhes = [], mensagemPersonalizada) {
    const definicao = CODIGOS_ERRO[codigo] ?? CODIGOS_ERRO.ERRO_INTERNO;
    super(mensagemPersonalizada ?? definicao.mensagem);
    this.codigo = codigo in CODIGOS_ERRO ? codigo : 'ERRO_INTERNO';
    this.status = definicao.status;
    this.detalhes = detalhes;
  }
}
