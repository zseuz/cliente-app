import { api, closeDb, crearVendedor, resetDb } from './helpers';

beforeEach(resetDb);
afterAll(closeDb);

describe('CRUD /api/vendedores', () => {
  it('crea, consulta, actualiza y elimina un vendedor', async () => {
    const creado = await crearVendedor({ email: 'LAURA@EMPRESA.COM', telefono: '300 123 4567' });
    expect(creado).toMatchObject({ id: 1, email: 'laura@empresa.com', activo: true });

    await api.get(`/api/vendedores/${creado.id}`).expect(200);

    const upd = await api
      .put(`/api/vendedores/${creado.id}`)
      .send({ nombre: 'Laura M', apellido: 'Gómez', email: 'laura@empresa.com', activo: false })
      .expect(200);
    expect(upd.body).toMatchObject({ nombre: 'Laura M', activo: false, telefono: null });

    await api.delete(`/api/vendedores/${creado.id}`).expect(204);
    await api.get(`/api/vendedores/${creado.id}`).expect(404);
  });

  it('pagina y busca', async () => {
    for (const n of ['Ana', 'Beto', 'Carla']) await crearVendedor({ nombre: n, apellido: n });
    const res = await api.get('/api/vendedores?page=1&limit=2').expect(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });

    const search = await api.get('/api/vendedores?search=bet').expect(200);
    expect(search.body.data.map((v: any) => v.nombre)).toEqual(['Beto']);
  });

  it('valida el body y responde 400 con detalle por campo', async () => {
    const res = await api.post('/api/vendedores').send({ nombre: 'A', email: 'no-email' }).expect(400);
    const fields = res.body.errors.map((e: any) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['nombre', 'apellido', 'email']));
  });

  it('rechaza emails duplicados (sin importar mayúsculas) con 409', async () => {
    await crearVendedor({ email: 'dup@x.com' });
    const res = await api.post('/api/vendedores').send({ nombre: 'Otro', apellido: 'Más', email: 'DUP@x.com' }).expect(409);
    expect(res.body.message).toMatch(/email/);
  });

  it('valida el id de la ruta', async () => {
    await api.get('/api/vendedores/abc').expect(400);
    await api.get('/api/vendedores/999').expect(404);
  });
});
