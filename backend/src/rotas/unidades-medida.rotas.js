import {
  unidadeMedidaCriacaoSchema,
  unidadeMedidaAtualizacaoSchema,
} from '../../../shared/schemas/unidade-medida.schema.js';
import * as unidadesServico from '../servicos/unidades.servico.js';
import { exigirUsuarioAutenticado } from '../util/autenticacao.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';
import {
  deZod, paramId, unidadeMedida, respostasErro, situacaoConsulta, SEGURANCA_USUARIO,
} from '../docs/openapi.js';

const TAG = ['Unidades de medida'];

function idOuErro(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroAplicacao('IDENTIFICADOR_INVALIDO');
  return id;
}

export async function unidadesMedidaRotas(fastify) {
  // RF20
  fastify.get('/api/unidades-medida', {
    schema: {
      tags: TAG,
      summary: 'Lista as unidades de medida',
      querystring: { type: 'object', properties: { situacao: situacaoConsulta } },
      response: {
        200: { description: 'Unidades cadastradas', type: 'array', items: unidadeMedida },
      },
    },
  }, async (request, reply) => {
    const { situacao = 'todos' } = request.query;
    const unidades = await unidadesServico.listar({ situacao });
    return reply.status(200).send(unidades);
  });

  // RF19
  fastify.post('/api/unidades-medida', {
    schema: {
      tags: TAG,
      summary: 'Cadastra uma unidade de medida',
      security: SEGURANCA_USUARIO,
      body: deZod(unidadeMedidaCriacaoSchema),
      response: {
        201: { description: 'Unidade criada', ...unidadeMedida },
        401: respostasErro[401],
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const dados = unidadeMedidaCriacaoSchema.parse(request.body);
    const unidade = await unidadesServico.cadastrar(dados);
    return reply.status(201).send(unidade);
  });

  // Edição — mesmo caso de uso do cadastro (RF19)
  fastify.put('/api/unidades-medida/:id', {
    schema: {
      tags: TAG,
      summary: 'Atualiza uma unidade de medida',
      security: SEGURANCA_USUARIO,
      params: paramId,
      body: deZod(unidadeMedidaAtualizacaoSchema),
      response: {
        200: { description: 'Unidade atualizada', ...unidadeMedida },
        401: respostasErro[401],
        404: respostasErro[404],
        409: respostasErro[409],
        422: respostasErro[422],
      },
    },
  }, async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const campos = unidadeMedidaAtualizacaoSchema.parse(request.body);
    const unidade = await unidadesServico.atualizar(id, campos);
    return reply.status(200).send(unidade);
  });
}
