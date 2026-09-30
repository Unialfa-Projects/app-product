import {
  produtoCriacaoSchema,
  produtoAtualizacaoSchema,
  produtoFiltroSchema,
} from '../../../shared/schemas/produto.schema.js';
import * as produtosServico from '../servicos/produtos.servico.js';
import { exigirUsuarioAutenticado } from '../util/autenticacao.js';
import { montarPaginacao } from '../util/paginacao.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import {
  deZod, paramId, produto, paginacao, historicoPreco, respostasErro, SEGURANCA_USUARIO,
} from '../docs/openapi.js';

const TAG = ['Produtos'];

function idOuErro(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroAplicacao('IDENTIFICADOR_INVALIDO');
  return id;
}

export async function produtosRotas(fastify) {
  // RF04, RF05, RF25
  fastify.get('/api/produtos', {
    schema: {
      tags: TAG,
      summary: 'Lista produtos com filtro e paginação',
      querystring: deZod(produtoFiltroSchema),
      response: {
        200: {
          description: 'Página de produtos',
          type: 'object',
          properties: { dados: { type: 'array', items: produto }, paginacao },
        },
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    const filtro = produtoFiltroSchema.parse(request.query);
    const { dados, total } = await produtosServico.listar(filtro);
    return reply.status(200).send({
      dados,
      paginacao: montarPaginacao({ pagina: filtro.pagina, limite: filtro.limite, total }),
    });
  });

  // RF03, RF25, RF26
  fastify.get('/api/produtos/:id', {
    schema: {
      tags: TAG,
      summary: 'Busca um produto pelo ID',
      params: paramId,
      response: {
        200: { description: 'Produto encontrado', ...produto },
        400: respostasErro[400],
        404: respostasErro[404],
      },
    },
  }, async (request, reply) => {
    const id = idOuErro(request.params.id);
    const produto = await produtosServico.buscarPorId(id);
    return reply.status(200).send(produto);
  });

  // RF14
  fastify.get('/api/produtos/:id/precos', {
    schema: {
      tags: TAG,
      summary: 'Histórico de alterações de preço do produto',
      params: paramId,
      response: {
        200: { description: 'Histórico de preço, do mais recente para o mais antigo', ...historicoPreco },
        404: respostasErro[404],
      },
    },
  }, async (request, reply) => {
    const id = idOuErro(request.params.id);
    const historico = await produtosServico.listarHistoricoDePreco(id);
    return reply.status(200).send({ produto_id: id, historico });
  });

  // RF01, RF06-RF09, RF22, RF28
  fastify.post('/api/produtos', {
    schema: {
      tags: TAG,
      summary: 'Cadastra um produto',
      security: SEGURANCA_USUARIO,
      body: deZod(produtoCriacaoSchema),
      response: {
        201: { description: 'Produto criado', ...produto },
        401: respostasErro[401],
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    const usuarioId = await exigirUsuarioAutenticado(request);
    const dados = produtoCriacaoSchema.parse(request.body);
    const produto = await produtosServico.cadastrar(dados, usuarioId);
    return reply.status(201).send(produto);
  });

  // RF02, RF13
  fastify.put('/api/produtos/:id', {
    schema: {
      tags: TAG,
      summary: 'Atualiza um produto (o SKU é imutável)',
      description: 'Alterações de preço geram registro no histórico de preço.',
      security: SEGURANCA_USUARIO,
      params: paramId,
      body: deZod(produtoAtualizacaoSchema),
      response: {
        200: { description: 'Produto atualizado', ...produto },
        401: respostasErro[401],
        404: respostasErro[404],
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    const usuarioId = await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const campos = produtoAtualizacaoSchema.parse(request.body);
    const produto = await produtosServico.atualizar(id, campos, usuarioId);
    return reply.status(200).send(produto);
  });

  // RF10
  fastify.patch('/api/produtos/:id/inativar', {
    schema: {
      tags: TAG,
      summary: 'Inativa um produto',
      security: SEGURANCA_USUARIO,
      params: paramId,
      response: {
        200: { description: 'Produto inativado', ...produto },
        401: respostasErro[401],
        404: respostasErro[404],
        409: respostasErro[409],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const produto = await produtosServico.inativar(id);
    return reply.status(200).send(produto);
  });

  // RF11
  fastify.patch('/api/produtos/:id/reativar', {
    schema: {
      tags: TAG,
      summary: 'Reativa um produto',
      security: SEGURANCA_USUARIO,
      params: paramId,
      response: {
        200: { description: 'Produto reativado', ...produto },
        401: respostasErro[401],
        404: respostasErro[404],
        409: respostasErro[409],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const produto = await produtosServico.reativar(id);
    return reply.status(200).send(produto);
  });

  // RF12, RN05, P-07
  fastify.delete('/api/produtos/:id', {
    schema: {
      tags: TAG,
      summary: 'Exclui fisicamente um produto',
      description: 'Só funciona com PERMITIR_EXCLUSAO_FISICA=true e para produtos sem histórico de preço.',
      security: SEGURANCA_USUARIO,
      params: paramId,
      response: {
        204: { description: 'Produto excluído', type: 'null' },
        401: respostasErro[401],
        404: respostasErro[404],
        409: respostasErro[409],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    await produtosServico.excluir(id);
    return reply.status(204).send();
  });
}
