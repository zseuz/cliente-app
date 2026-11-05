import request from 'supertest';
import { createApp } from '../src/app';
import { pool } from '../src/config/database';

export const api = request(createApp());

export async function resetDb(): Promise<void> {
  await pool.query('TRUNCATE venta, producto, vendedor RESTART IDENTITY CASCADE');
}

export async function crearVendedor(overrides: Record<string, unknown> = {}) {
  const res = await api
    .post('/api/vendedores')
    .send({ nombre: 'Laura', apellido: 'Gómez', email: `laura${Math.random()}@x.com`, ...overrides })
    .expect(201);
  return res.body;
}

export async function crearProducto(overrides: Record<string, unknown> = {}) {
  const res = await api
    .post('/api/productos')
    .send({ codigo: `P-${Math.floor(Math.random() * 1e6)}`, nombre: 'Monitor', precio: 100.5, stock: 10, ...overrides })
    .expect(201);
  return res.body;
}

export const closeDb = () => pool.end();
