import { createServer } from 'http';

import { loadEnvironment } from '@portfolio-cms/config';

import { createApp } from './app';
import { logger } from './logger';

async function bootstrap() {
  const env = loadEnvironment();
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API server listening');
  });

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down');
    server.close(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down');
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
