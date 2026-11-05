import { PoolClient } from 'pg';
import { withTransaction } from '../config/database';
import { Producto, ProductoModel } from '../models/producto.model';
import { VendedorModel } from '../models/vendedor.model';
import { VentaDetalle, VentaFilters, VentaModel } from '../models/venta.model';
import { HttpError } from '../utils/http-error';
import { paginate, Paginated } from '../utils/pagination';

export interface VentaInput {
  vendedorId: number;
  productoId: number;
  cantidad: number;
  fecha?: Date;
  observaciones?: string | null;
}

export type VentaListResult = Paginated<VentaDetalle> & { summary: { totalVendido: number } };

/**
 * Bloquea (SELECT ... FOR UPDATE) los productos indicados siempre en orden
 * ascendente de id, para evitar deadlocks entre transacciones concurrentes.
 */
async function lockProductos(ids: number[], client: PoolClient): Promise<Map<number, Producto>> {
  const locked = new Map<number, Producto>();
  for (const id of [...new Set(ids)].sort((a, b) => a - b)) {
    const producto = await ProductoModel.findById(id, client, true);
    if (producto) locked.set(id, producto);
  }
  return locked;
}

async function assertVendedorActivo(id: number, client: PoolClient): Promise<void> {
  const vendedor = await VendedorModel.findById(id, client);
  if (!vendedor) throw HttpError.unprocessable(`El vendedor ${id} no existe`);
  if (!vendedor.activo) throw HttpError.unprocessable(`El vendedor ${vendedor.nombre} ${vendedor.apellido} está inactivo`);
}

function assertStock(producto: Producto, disponible: number, solicitado: number): void {
  if (solicitado > disponible) {
    throw HttpError.conflict(`Stock insuficiente para "${producto.nombre}": disponible ${disponible}, solicitado ${solicitado}`, {
      disponible,
      solicitado,
    });
  }
}

/**
 * Reglas de negocio de ventas. Toda operación que toca inventario corre en
 * una única transacción: la venta y el movimiento de stock se confirman o se
 * revierten juntos.
 */
export const VentaService = {
  async list(f: VentaFilters): Promise<VentaListResult> {
    const { rows, total, sumTotal } = await VentaModel.findAll(f);
    return { ...paginate(rows, total, f), summary: { totalVendido: sumTotal } };
  },

  async get(id: number): Promise<VentaDetalle> {
    const venta = await VentaModel.findById(id);
    if (!venta) throw HttpError.notFound(`Venta ${id} no encontrada`);
    return venta;
  },

  create(input: VentaInput): Promise<VentaDetalle> {
    return withTransaction(async (client) => {
      await assertVendedorActivo(input.vendedorId, client);

      const producto = (await lockProductos([input.productoId], client)).get(input.productoId);
      if (!producto) throw HttpError.unprocessable(`El producto ${input.productoId} no existe`);
      if (!producto.activo) throw HttpError.unprocessable(`El producto "${producto.nombre}" está inactivo`);
      assertStock(producto, producto.stock, input.cantidad);

      const venta = await VentaModel.create({ ...input, precioUnitario: producto.precio }, client);
      await ProductoModel.adjustStock(producto.id, -input.cantidad, client);

      return (await VentaModel.findById(venta.id, client))!;
    });
  },

  update(id: number, input: VentaInput): Promise<VentaDetalle> {
    return withTransaction(async (client) => {
      const actual = await VentaModel.lockById(id, client);
      if (!actual) throw HttpError.notFound(`Venta ${id} no encontrada`);

      if (input.vendedorId !== actual.vendedorId) await assertVendedorActivo(input.vendedorId, client);

      const productos = await lockProductos([actual.productoId, input.productoId], client);
      const nuevo = productos.get(input.productoId);
      if (!nuevo) throw HttpError.unprocessable(`El producto ${input.productoId} no existe`);

      const mismoProducto = nuevo.id === actual.productoId;
      if (!mismoProducto && !nuevo.activo) throw HttpError.unprocessable(`El producto "${nuevo.nombre}" está inactivo`);

      // Si es el mismo producto, las unidades de la venta original vuelven a estar disponibles.
      const disponible = nuevo.stock + (mismoProducto ? actual.cantidad : 0);
      assertStock(nuevo, disponible, input.cantidad);

      // Se conserva el precio histórico si no cambia el producto.
      const precioUnitario = mismoProducto ? actual.precioUnitario : nuevo.precio;

      await ProductoModel.adjustStock(actual.productoId, actual.cantidad, client);
      await ProductoModel.adjustStock(nuevo.id, -input.cantidad, client);
      await VentaModel.update(id, { ...input, precioUnitario }, client);

      return (await VentaModel.findById(id, client))!;
    });
  },

  remove(id: number): Promise<void> {
    return withTransaction(async (client) => {
      const venta = await VentaModel.lockById(id, client);
      if (!venta) throw HttpError.notFound(`Venta ${id} no encontrada`);
      await lockProductos([venta.productoId], client);
      await ProductoModel.adjustStock(venta.productoId, venta.cantidad, client);
      await VentaModel.remove(id, client);
    });
  },
};
