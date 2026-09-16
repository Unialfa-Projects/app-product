import Fastify from 'fastify';
import { ZodError } from 'zod';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { produtoRoutes } from './routes/produto.routes.js';
import { openapi } from './openapi.js';
import { pool } from './db.js';
import { ApiError } from './http.js';

export function createApp(options = {}) {
  const app = Fastify(options);

  app.register(cors, { origin: process.env.CORS_ORIGIN?.split(',') ?? false });
  app.register(helmet);
  app.register(swagger, { mode: 'static', specification: { document: openapi } });
  app.register(swaggerUi, { routePrefix: '/docs' });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      return reply.code(error.status).send({ erro: error.message, codigo: error.codigo, detalhes: [] });
    }
    if (error instanceof ZodError) {
      return reply.code(422).send({
        erro: 'Dados inválidos',
        codigo: 'DADOS_INVALIDOS',
        detalhes: error.issues,
      });
    }

    if (error.code === '23505') {
      const conflitos = {
        produto_sku_key: ['SKU_DUPLICADO', 'SKU já cadastrado'],
        categoria_nome_key: ['CATEGORIA_DUPLICADA', 'Categoria já cadastrada'],
        unidade_medida_sigla_key: ['SIGLA_DUPLICADA', 'Sigla já cadastrada'],
      };
      const [codigo, mensagem] = conflitos[error.constraint] ?? ['REGISTRO_DUPLICADO', 'Registro duplicado'];
      return reply.code(409).send({ erro: mensagem, codigo, detalhes: [] });
    }

    if (error.code === '23503') {
      return reply.code(422).send({ erro: 'Referência inexistente', codigo: 'REFERENCIA_INVALIDA', detalhes: [] });
    }

    request.log.error(error);
    return reply.code(error.statusCode || 500).send({
      erro: error.statusCode && error.statusCode < 500 ? error.message : 'Erro interno do servidor',
      codigo: error.statusCode && error.statusCode < 500 ? 'REQUISICAO_INVALIDA' : 'ERRO_INTERNO',
      detalhes: [],
    });
  });

  app.setNotFoundHandler((request, reply) => reply.code(404).send({
    erro: 'Rota não encontrada', codigo: 'ROTA_NAO_ENCONTRADA', detalhes: [],
  }));

  app.get('/health', { schema: { hide: true } }, async () => {
    await pool.query('SELECT 1');
    return { status: 'ok' };
  });
  app.register(produtoRoutes);
  return app;
}
