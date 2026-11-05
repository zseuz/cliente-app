import { DatabaseError } from 'pg';
import { Vendedor, VendedorInput, VendedorModel } from '../models/vendedor.model';
import { HttpError } from '../utils/http-error';
import { paginate, Paginated, PaginationQuery } from '../utils/pagination';

export const VendedorService = {
  async list(q: PaginationQuery): Promise<Paginated<Vendedor>> {
    const { rows, total } = await VendedorModel.findAll(q);
    return paginate(rows, total, q);
  },

  async get(id: number): Promise<Vendedor> {
    const vendedor = await VendedorModel.findById(id);
    if (!vendedor) throw HttpError.notFound(`Vendedor ${id} no encontrado`);
    return vendedor;
  },

  create(data: VendedorInput): Promise<Vendedor> {
    return VendedorModel.create(data);
  },

  async update(id: number, data: VendedorInput): Promise<Vendedor> {
    const vendedor = await VendedorModel.update(id, data);
    if (!vendedor) throw HttpError.notFound(`Vendedor ${id} no encontrado`);
    return vendedor;
  },

  async remove(id: number): Promise<void> {
    try {
      if (!(await VendedorModel.remove(id))) throw HttpError.notFound(`Vendedor ${id} no encontrado`);
    } catch (err) {
      if (err instanceof DatabaseError && err.code === '23503') {
        throw HttpError.conflict('No se puede eliminar: el vendedor tiene ventas registradas. Puede desactivarlo.');
      }
      throw err;
    }
  },
};
