import {
  categoriaCriacaoSchema,
  categoriaAtualizacaoSchema,
} from '../../../shared/schemas/categoria.schema.js';
import * as categoriasServico from '../servicos/categorias.servico.js';
import { exigirUsuarioAutenticado } from '../util/autenticacao.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';

function idOuErro(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroAplicacao('IDENTIFICADOR_INVALIDO');
  return id;
}

export async function categoriasRotas(fastify) {
  // RF17, RF33 (proposta)
  fastify.get('/api/categorias', async (request, reply) => {
    const { formato, situacao = 'todos' } = request.query;
    const categorias = await categoriasServico.listar({ formato, situacao });
    return reply.status(200).send(categorias);
  });

  // RF15
  fastify.post('/api/categorias', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const dados = categoriaCriacaoSchema.parse(request.body);
    const categoria = await categoriasServico.cadastrar(dados);
    return reply.status(201).send(categoria);
  });

  // RF16
  fastify.put('/api/categorias/:id', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const campos = categoriaAtualizacaoSchema.parse(request.body);
    const categoria = await categoriasServico.atualizar(id, campos);
    return reply.status(200).send(categoria);
  });

  // RF18 / RN07
  fastify.patch('/api/categorias/:id/inativar', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const categoria = await categoriasServico.inativar(id);
    return reply.status(200).send(categoria);
  });

  fastify.patch('/api/categorias/:id/reativar', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const categoria = await categoriasServico.reativar(id);
    return reply.status(200).send(categoria);
  });
}
