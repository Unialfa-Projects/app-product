import { usuarioCadastroSchema, usuarioLoginSchema } from '../../../shared/schemas/usuario.schema.js';
import * as authServico from '../servicos/auth.servico.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import { deZod, usuario, respostasErro, SEGURANCA_USUARIO } from '../docs/openapi.js';

const TAG = ['Autenticação'];

export async function authRotas(fastify) {
  // RF29, RF31, RN13, RNF13
  fastify.post('/api/auth/cadastro', {
    schema: {
      tags: TAG,
      summary: 'Cadastra um novo usuário',
      body: deZod(usuarioCadastroSchema),
      response: {
        201: { description: 'Usuário criado (a senha nunca é retornada)', ...usuario },
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    const dados = usuarioCadastroSchema.parse(request.body);
    const usuario = await authServico.cadastrar(dados);
    return reply.status(201).send(usuario);
  });

  // RF30
  fastify.post('/api/auth/login', {
    schema: {
      tags: TAG,
      summary: 'Autentica o usuário e devolve seus dados',
      description: 'Use o `id` retornado no header `x-usuario-id` (botão **Authorize**) para chamar as rotas de escrita.',
      body: deZod(usuarioLoginSchema),
      response: {
        200: { description: 'Credenciais válidas', ...usuario },
        401: respostasErro[401],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    const dados = usuarioLoginSchema.parse(request.body);
    const usuario = await authServico.login(dados);
    return reply.status(200).send(usuario);
  });

  // RF32 — revalidação de sessão ao recarregar a página
  fastify.get('/api/auth/eu', {
    schema: {
      tags: TAG,
      summary: 'Retorna o usuário identificado pelo header x-usuario-id',
      security: SEGURANCA_USUARIO,
      response: {
        200: { description: 'Usuário autenticado', ...usuario },
        401: respostasErro[401],
      },
    },
  }, async (request, reply) => {
    const usuarioId = Number(request.headers['x-usuario-id']);
    if (!usuarioId) throw new ErroAplicacao('NAO_AUTENTICADO');

    const usuario = await authServico.buscarUsuarioAutenticado(usuarioId);
    if (!usuario) throw new ErroAplicacao('NAO_AUTENTICADO');

    return reply.status(200).send(usuario);
  });
}
