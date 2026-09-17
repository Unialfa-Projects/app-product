import { ZodError } from 'zod';
import { ErroAplicacao } from './erro-aplicacao.js';
import { CODIGOS_ERRO } from './codigos.js';

function corpoErro(codigo, mensagem, detalhes = []) {
  return { erro: mensagem, codigo, detalhes };
}

// Handler global (RNF08): toda resposta de erro segue { erro, codigo, detalhes }
export function handlerGlobalDeErro(erro, request, reply) {
  if (erro instanceof ZodError) {
    const detalhes = erro.issues.map((issue) => ({
      campo: issue.path.join('.'),
      mensagem: issue.message,
    }));
    return reply.status(422).send(corpoErro('VALIDACAO', CODIGOS_ERRO.VALIDACAO.mensagem, detalhes));
  }

  if (erro instanceof ErroAplicacao) {
    return reply.status(erro.status).send(corpoErro(erro.codigo, erro.message, erro.detalhes));
  }

  // Erro de validação de schema do próprio Fastify (querystring/params)
  if (erro.validation) {
    const detalhes = erro.validation.map((v) => ({
      campo: v.instancePath?.replace(/^\//, '') || v.params?.missingProperty || '',
      mensagem: v.message,
    }));
    return reply.status(422).send(corpoErro('VALIDACAO', CODIGOS_ERRO.VALIDACAO.mensagem, detalhes));
  }

  // Erro do próprio Fastify (ex.: FST_ERR_CTP_EMPTY_JSON_BODY) — já é erro de cliente, não interno
  if (typeof erro.statusCode === 'number' && erro.statusCode >= 400 && erro.statusCode < 500) {
    request.log.warn({ err: erro }, 'Requisição malformada');
    return reply.status(erro.statusCode).send(corpoErro('PARAMETRO_INVALIDO', erro.message));
  }

  request.log.error({ err: erro }, 'Erro não tratado');
  return reply.status(500).send(corpoErro('ERRO_INTERNO', CODIGOS_ERRO.ERRO_INTERNO.mensagem));
}
