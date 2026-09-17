import {
  unidadeMedidaCriacaoSchema,
  unidadeMedidaAtualizacaoSchema,
} from '../../../shared/schemas/unidade-medida.schema.js';
import * as unidadesServico from '../servicos/unidades.servico.js';
import { exigirUsuarioAutenticado } from '../util/autenticacao.js';
import { ErroAplicacao } from '../erros/erro-aplicacao.js';

function idOuErro(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ErroAplicacao('IDENTIFICADOR_INVALIDO');
  return id;
}

export async function unidadesMedidaRotas(fastify) {
  // RF20
  fastify.get('/api/unidades-medida', async (request, reply) => {
    const { situacao = 'todos' } = request.query;
    const unidades = await unidadesServico.listar({ situacao });
    return reply.status(200).send(unidades);
  });

  // RF19
  fastify.post('/api/unidades-medida', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const dados = unidadeMedidaCriacaoSchema.parse(request.body);
    const unidade = await unidadesServico.cadastrar(dados);
    return reply.status(201).send(unidade);
  });

  // Edição — mesmo caso de uso do cadastro (RF19)
  fastify.put('/api/unidades-medida/:id', async (request, reply) => {
    await exigirUsuarioAutenticado(request);
    const id = idOuErro(request.params.id);
    const campos = unidadeMedidaAtualizacaoSchema.parse(request.body);
    const unidade = await unidadesServico.atualizar(id, campos);
    return reply.status(200).send(unidade);
  });
}
