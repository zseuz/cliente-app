import { createApp } from './app';
import { pool } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = createApp().listen(env.PORT, () => {
  logger.info(`API escuchando en http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
});

/** Apagado ordenado: deja de aceptar conexiones y cierra el pool de Postgres. */
function shutdown(signal: string): void {
  logger.info(`${signal} recibido, cerrando...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => logger.error('unhandledRejection', reason));
