import { api, closeDb, crearProducto, resetDb } from './helpers';

beforeEach(resetDb);
afterAll(closeDb);

describe('CRUD /api/productos', () => {
  it('crea normalizando el código y devuelve precio numérico', async () => {
    const p = await crearProducto({ codigo: 'mon-24', precio: '650000.50' });
    expect(p).toMatchObject({ codigo: 'MON-24', precio: 650000.5, stock: 10 });
  });

  it('actualiza y elimina', async () => {
    const p = await crearProducto();
    const res = await api.put(`/api/productos/${p.id}`).send({ ...p, nombre: 'Monitor 27"', stock: 3 }).expect(200);
    expect(res.body).toMatchObject({ nombre: 'Monitor 27"', stock: 3 });
    await api.delete(`/api/productos/${p.id}`).expect(204);
  });

  it('rechaza precio/stock negativos y códigos duplicados', async () => {
    await api.post('/api/productos').send({ codigo: 'X1', nombre: 'Algo', precio: -1, stock: -2 }).expect(400);
    await crearProducto({ codigo: 'X1' });
    await api.post('/api/productos').send({ codigo: 'x1', nombre: 'Otro', precio: 1, stock: 1 }).expect(409);
  });
});
