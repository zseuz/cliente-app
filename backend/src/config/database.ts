import { Pool, PoolClient, types } from 'pg';
import { env } from './env';

// NUMERIC (1700) y BIGINT/COUNT (20) llegan como string por defecto.
types.setTypeParser(1700, (v) => parseFloat(v));
types.setTypeParser(20, (v) => parseInt(v, 10));

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
});

/** Cualquier cosa capaz de ejecutar SQL: el pool o un cliente dentro de una transacción. */
export type Queryable = Pool | PoolClient;

/**
 * Ejecuta `work` dentro de una transacción. Hace COMMIT si termina bien
 * y ROLLBACK ante cualquier error, liberando siempre el cliente.
 */
export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
