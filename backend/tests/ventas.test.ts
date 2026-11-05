import { api, closeDb, crearProducto, crearVendedor, resetDb } from './helpers';

beforeEach(resetDb);
afterAll(closeDb);

const stockDe = async (id: number) => (await api.get(`/api/productos/${id}`)).body.stock;

describe('CRUD /api/ventas con control de inventario', () => {
  it('registra la venta congelando el precio y descontando stock', async () => {
    const v = await crearVendedor();
    const p = await crearProducto({ precio: 200, stock: 10 });

    const res = await api.post('/api/ventas').send({ vendedorId: v.id, productoId: p.id, cantidad: 3 }).expect(201);
    expect(res.body).toMatchObject({
      cantidad: 3,
      precioUnitario: 200,
      total: 600,
      vendedor: { id: v.id, nombre: 'Laura' },
      producto: { id: p.id },
    });
    expect(await stockDe(p.id)).toBe(7);

    // Un cambio posterior de precio no altera la venta histórica.
    await api.put(`/api/productos/${p.id}`).send({ ...p, precio: 999, stock: 7 }).expect(200);
    expect((await api.get(`/api/ventas/${res.body.id}`)).body.precioUnitario).toBe(200);
  });

  it('rechaza ventas sin stock suficiente sin modificar inventario', async () => {
    const v = await crearVendedor();
    const p = await crearProducto({ stock: 2 });
    const res = await api.post('/api/ventas').send({ vendedorId: v.id, productoId: p.id, cantidad: 5 }).expect(409);
    expect(res.body.details).toEqual({ disponible: 2, solicitado: 5 });
    expect(await stockDe(p.id)).toBe(2);
  });

  it('rechaza vendedor/producto inexistente o inactivo con 422', async () => {
    const v = await crearVendedor({ activo: false });
    const p = await crearProducto();
    await api.post('/api/ventas').send({ vendedorId: v.id, productoId: p.id, cantidad: 1 }).expect(422);
    await api.post('/api/ventas').send({ vendedorId: 999, productoId: p.id, cantidad: 1 }).expect(422);
  });

  it('al editar recalcula stock (mismo producto y cambio de producto)', async () => {
    const v = await crearVendedor();
    const a = await crearProducto({ stock: 10, precio: 10 });
    const b = await crearProducto({ stock: 5, precio: 20 });
    const venta = (await api.post('/api/ventas').send({ vendedorId: v.id, productoId: a.id, cantidad: 4 })).body;
    expect(await stockDe(a.id)).toBe(6);

    // Misma venta, misma referencia: puede usar sus propias unidades (6 + 4 = 10).
    await api.put(`/api/ventas/${venta.id}`).send({ vendedorId: v.id, productoId: a.id, cantidad: 10 }).expect(200);
    expect(await stockDe(a.id)).toBe(0);

    // Cambia a producto B: se devuelven 10 a A y se descuentan 2 de B con el precio de B.
    const res = await api.put(`/api/ventas/${venta.id}`).send({ vendedorId: v.id, productoId: b.id, cantidad: 2 }).expect(200);
    expect(res.body).toMatchObject({ precioUnitario: 20, total: 40 });
    expect(await stockDe(a.id)).toBe(10);
    expect(await stockDe(b.id)).toBe(3);
  });

  it('al eliminar devuelve el stock y bloquea borrar maestros con ventas', async () => {
    const v = await crearVendedor();
    const p = await crearProducto({ stock: 10 });
    const venta = (await api.post('/api/ventas').send({ vendedorId: v.id, productoId: p.id, cantidad: 4 })).body;

    await api.delete(`/api/vendedores/${v.id}`).expect(409);
    await api.delete(`/api/productos/${p.id}`).expect(409);

    await api.delete(`/api/ventas/${venta.id}`).expect(204);
    expect(await stockDe(p.id)).toBe(10);
  });

  it('no sobrevende ante ventas concurrentes', async () => {
    const v = await crearVendedor();
    const p = await crearProducto({ stock: 5 });
    const results = await Promise.all(
      Array.from({ length: 8 }, () => api.post('/api/ventas').send({ vendedorId: v.id, productoId: p.id, cantidad: 1 })),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(5);
    expect(results.filter((r) => r.status === 409)).toHaveLength(3);
    expect(await stockDe(p.id)).toBe(0);
  });

  it('filtra por vendedor y devuelve el total vendido', async () => {
    const v1 = await crearVendedor();
    const v2 = await crearVendedor({ nombre: 'Carlos' });
    const p = await crearProducto({ precio: 50, stock: 100 });
    await api.post('/api/ventas').send({ vendedorId: v1.id, productoId: p.id, cantidad: 2 });
    await api.post('/api/ventas').send({ vendedorId: v2.id, productoId: p.id, cantidad: 3 });

    const res = await api.get(`/api/ventas?vendedorId=${v2.id}`).expect(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.summary.totalVendido).toBe(150);
  });
});
