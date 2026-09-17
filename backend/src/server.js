import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env } from './config/env.js';
import { handlerGlobalDeErro } from './erros/handler.js';
import { healthRotas } from './rotas/health.rotas.js';
import { authRotas } from './rotas/auth.rotas.js';
import { produtosRotas } from './rotas/produtos.rotas.js';
import { categoriasRotas } from './rotas/categorias.rotas.js';
import { unidadesMedidaRotas } from './rotas/unidades-medida.rotas.js';

const fastify = Fastify({ logger: { level: env.LOG_LEVEL } });

await fastify.register(helmet, { contentSecurityPolicy: false });
await fastify.register(cors, {
  origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-usuario-id'],
});

await fastify.register(swagger, {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'SIGE — Módulo Produtos',
      description: 'API do cadastro central de produtos, categorias, unidades de medida e autenticação simples.',
      version: '2.0.0',
    },
    servers: [{ url: '/', description: 'Servidor atual' }],
    tags: [
      { name: 'Saúde' },
      { name: 'Autenticação' },
      { name: 'Produtos' },
      { name: 'Categorias' },
      { name: 'Unidades de medida' },
    ],
  },
});
await fastify.register(swaggerUi, { routePrefix: '/api/docs' });

fastify.setErrorHandler(handlerGlobalDeErro);

await fastify.register(healthRotas);
await fastify.register(authRotas);
await fastify.register(produtosRotas);
await fastify.register(categoriasRotas);
await fastify.register(unidadesMedidaRotas);

try {
  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
  fastify.log.info(`SIGE Produtos API no ar em http://localhost:${env.PORT}`);
  fastify.log.info(`Documentação OpenAPI em http://localhost:${env.PORT}/api/docs`);
} catch (erro) {
  fastify.log.error(erro);
  process.exit(1);
}
