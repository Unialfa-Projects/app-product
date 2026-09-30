import {
  categoriaCriacaoSchema,
  categoriaAtualizacaoSchema,
} from '../../../shared/schemas/categoria.schema.js';
import * as categoriasServico from '../servicos/categorias.servico.js';
import { exigirUsuarioAutenticado } from '../util/autenticacao.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import {
  deZod, paramId, categoria, respostasErro, situacaoConsulta, SEGURANCA_USUARIO,
} from '../docs/openapi.js';

const TAG = ['Categorias'];

function idOuErro(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroAplicacao('IDENTIFICADOR_INVALIDO');
  return id;
}

export async function categoriasRotas(fastify) {
  // RF17, RF33 (proposta)
  fastify.get('/api/categorias', {
    schema: {
      tags: TAG,
      summary: 'Lista as categorias',
      querystring: {
        type: 'object',
        properties: {
          formato: { type: 'string', enum: ['lista', 'arvore'], description: '`arvore` agrupa as subcategorias dentro da categoria pai' },
          situacao: situacaoConsulta,
        },
      },
      response: {
        200: { description: 'Categorias cadastradas', type: 'array', items: categoria },
      },
    },
  }, async (request, reply) => {
    const { formato, situacao = 'todos' } = request.query;
    const categorias = await categoriasServico.listar({ formato, situacao });
    return reply.status(200).send(categorias);
  });

  // RF15
  fastify.post('/api/categorias', {
    schema: {
      tags: TAG,
      summary: 'Cadastra uma categoria',
      security: SEGURANCA_USUARIO,
      body: deZod(categoriaCriacaoSchema),
      response: {
        201: { description: 'Categoria criada', ...categoria },
        401: respostasErro[401],
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const dados = categoriaCriacaoSchema.parse(request.body);
    const categoria = await categoriasServico.cadastrar(dados);
    return reply.status(201).send(categoria);
  });

  // RF16
  fastify.put('/api/categorias/:id', {
    schema: {
      tags: TAG,
      summary: 'Atualiza uma categoria',
      security: SEGURANCA_USUARIO,
      params: paramId,
      body: deZod(categoriaAtualizacaoSchema),
      response: {
        200: { description: 'Categoria atualizada', ...categoria },
        401: respostasErro[401],
        404: respostasErro[404],
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const campos = categoriaAtualizacaoSchema.parse(request.body);
    const categoria = await categoriasServico.atualizar(id, campos);
    return reply.status(200).send(categoria);
  });
}
