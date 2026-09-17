import { createApp } from './src/app.js';
import { env } from './src/config/env.js';

const app = createApp({ logger: true });

try {
  await app.listen({ port: env.port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
