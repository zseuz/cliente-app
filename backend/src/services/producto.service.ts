import { DatabaseError } from 'pg';
import { Producto, ProductoInput, ProductoModel } from '../models/producto.model';
import { HttpError } from '../utils/http-error';
import { paginate, Paginated, PaginationQuery } from '../utils/pagination';

export const ProductoService = {
  async list(q: PaginationQuery): Promise<Paginated<Producto>> {
    const { rows, total } = await ProductoModel.findAll(q);
    return paginate(rows, total, q);
  },

  async get(id: number): Promise<Producto> {
    const producto = await ProductoModel.findById(id);
    if (!producto) throw HttpError.notFound(`Producto ${id} no encontrado`);
    return producto;
  },

  create(data: ProductoInput): Promise<Producto> {
    return ProductoModel.create(data);
  },

  async update(id: number, data: ProductoInput): Promise<Producto> {
    const producto = await ProductoModel.update(id, data);
    if (!producto) throw HttpError.notFound(`Producto ${id} no encontrado`);
    return producto;
  },

  async remove(id: number): Promise<void> {
    try {
      if (!(await ProductoModel.remove(id))) throw HttpError.notFound(`Producto ${id} no encontrado`);
    } catch (err) {
      if (err instanceof DatabaseError && err.code === '23503') {
        throw HttpError.conflict('No se puede eliminar: el producto tiene ventas registradas. Puede desactivarlo.');
      }
      throw err;
    }
  },
};
