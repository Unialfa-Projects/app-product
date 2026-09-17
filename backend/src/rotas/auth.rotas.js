import { usuarioCadastroSchema, usuarioLoginSchema } from '../../../shared/schemas/usuario.schema.js';
import * as authServico from '../servicos/auth.servico.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';

export async function authRotas(fastify) {
  // RF29, RF31, RN13, RNF13
  fastify.post('/api/auth/cadastro', async (request, reply) => {
    const dados = usuarioCadastroSchema.parse(request.body);
    const usuario = await authServico.cadastrar(dados);
    return reply.status(201).send(usuario);
  });

  // RF30
  fastify.post('/api/auth/login', async (request, reply) => {
    const dados = usuarioLoginSchema.parse(request.body);
    const usuario = await authServico.login(dados);
    return reply.status(200).send(usuario);
  });

  // RF32 — revalidação de sessão ao recarregar a página
  fastify.get('/api/auth/eu', async (request, reply) => {
    const usuarioId = Number(request.headers['x-usuario-id']);
    if (!usuarioId) throw new ErroAplicacao('NAO_AUTENTICADO');

    const usuario = await authServico.buscarUsuarioAutenticado(usuarioId);
    if (!usuario) throw new ErroAplicacao('NAO_AUTENTICADO');

    return reply.status(200).send(usuario);
  });
}
