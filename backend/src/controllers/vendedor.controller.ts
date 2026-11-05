import { Request, Response } from 'express';
import { VendedorService } from '../services/vendedor.service';

/** Controller: traduce HTTP <-> servicio. Sin lógica de negocio ni SQL. */
export const VendedorController = {
  async list(_req: Request, res: Response) {
    res.json(await VendedorService.list(res.locals.query));
  },
  async get(_req: Request, res: Response) {
    res.json(await VendedorService.get(res.locals.params.id));
  },
  async create(_req: Request, res: Response) {
    const vendedor = await VendedorService.create(res.locals.body);
    res.status(201).location(`/api/vendedores/${vendedor.id}`).json(vendedor);
  },
  async update(_req: Request, res: Response) {
    res.json(await VendedorService.update(res.locals.params.id, res.locals.body));
  },
  async remove(_req: Request, res: Response) {
    await VendedorService.remove(res.locals.params.id);
    res.status(204).end();
  },
};
