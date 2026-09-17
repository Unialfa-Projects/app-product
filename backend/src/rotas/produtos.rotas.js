import {
  produtoCriacaoSchema,
  produtoAtualizacaoSchema,
  produtoFiltroSchema,
} from '../../../shared/schemas/produto.schema.js';
import * as produtosServico from '../servicos/produtos.servico.js';
import { exigirUsuarioAutenticado } from '../util/autenticacao.js';
import { montarPaginacao } from '../util/paginacao.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';

function idOuErro(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroAplicacao('IDENTIFICADOR_INVALIDO');
  return id;
}

export async function produtosRotas(fastify) {
  // RF04, RF05, RF25
  fastify.get('/api/produtos', async (request, reply) => {
    const filtro = produtoFiltroSchema.parse(request.query);
    const { dados, total } = await produtosServico.listar(filtro);
    return reply.status(200).send({
      dados,
      paginacao: montarPaginacao({ pagina: filtro.pagina, limite: filtro.limite, total }),
    });
  });

  // RF03, RF25, RF26
  fastify.get('/api/produtos/:id', async (request, reply) => {
    const id = idOuErro(request.params.id);
    const produto = await produtosServico.buscarPorId(id);
    return reply.status(200).send(produto);
  });

  // RF14
  fastify.get('/api/produtos/:id/precos', async (request, reply) => {
    const id = idOuErro(request.params.id);
    const historico = await produtosServico.listarHistoricoDePreco(id);
    return reply.status(200).send({ produto_id: id, historico });
  });

  // RF01, RF06-RF09, RF22, RF28
  fastify.post('/api/produtos', async (request, reply) => {
    const usuarioId = await exigirUsuarioAutenticado(request);
    const dados = produtoCriacaoSchema.parse(request.body);
    const produto = await produtosServico.cadastrar(dados, usuarioId);
    return reply.status(201).send(produto);
  });

  // RF02, RF13
  fastify.put('/api/produtos/:id', async (request, reply) => {
    const usuarioId = await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const campos = produtoAtualizacaoSchema.parse(request.body);
    const produto = await produtosServico.atualizar(id, campos, usuarioId);
    return reply.status(200).send(produto);
  });

  // RF10
  fastify.patch('/api/produtos/:id/inativar', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const produto = await produtosServico.inativar(id);
    return reply.status(200).send(produto);
  });

  // RF11
  fastify.patch('/api/produtos/:id/reativar', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const produto = await produtosServico.reativar(id);
    return reply.status(200).send(produto);
  });

  // RF12, RN05, P-07
  fastify.delete('/api/produtos/:id', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    await produtosServico.excluir(id);
    return reply.status(204).send();
  });
}
