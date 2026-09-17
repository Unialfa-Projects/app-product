export async function healthRotas(fastify) {
  fastify.get('/api/health', {
    schema: {
      tags: ['Saúde'],
      summary: 'Verifica se a API está no ar',
      response: { 200: { type: 'object', properties: { status: { type: 'string' } } } },
    },
  }, async () => ({ status: 'ok' }));
}
