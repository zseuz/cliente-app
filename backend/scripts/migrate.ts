/**
 * Runner de migraciones minimalista: aplica en orden los .sql de db/migrations
 * que aún no estén registrados en la tabla schema_migrations, cada uno en su
 * propia transacción. Con --seed también ejecuta db/seeds.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pool } from '../src/config/database';
import { logger } from '../src/utils/logger';

// Funciona tanto con ts-node (scripts/) como compilado (dist/scripts/).
const DB_DIR =
  [path.resolve(__dirname, '..', 'db'), path.resolve(__dirname, '..', '..', 'db')].find((dir) =>
    fs.existsSync(dir),
  ) ?? path.resolve(process.cwd(), 'db');

function sqlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
}

export async function migrate(withSeed = false): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);

    const { rows } = await client.query<{ name: string }>('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((r) => r.name));
    const migrationsDir = path.join(DB_DIR, 'migrations');

    for (const file of sqlFiles(migrationsDir)) {
      if (applied.has(file)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        logger.info(`Migración aplicada: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Falló la migración ${file}: ${(err as Error).message}`);
      }
    }

    if (withSeed) {
      const seedsDir = path.join(DB_DIR, 'seeds');
      for (const file of sqlFiles(seedsDir)) {
        await client.query(fs.readFileSync(path.join(seedsDir, file), 'utf8'));
        logger.info(`Seed ejecutado: ${file}`);
      }
    }
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate(process.argv.includes('--seed'))
    .then(() => logger.info('Base de datos al día'))
    .catch((err) => {
      logger.error(err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
