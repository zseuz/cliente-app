import { Client } from 'pg';
import './setup-env';

/** Crea la BD de pruebas desde cero y aplica las migraciones. */
export default async function globalSetup(): Promise<void> {
  const dbName = process.env.DB_NAME!;
  const admin = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await admin.connect();
  await admin.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
  await admin.query(`CREATE DATABASE "${dbName}"`);
  await admin.end();

  const { migrate } = await import('../scripts/migrate');
  const { pool } = await import('../src/config/database');
  await migrate();
  await pool.end();
}
