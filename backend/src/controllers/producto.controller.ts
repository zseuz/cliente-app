import { Request, Response } from 'express';
import { ProductoService } from '../services/producto.service';

export const ProductoController = {
  async list(_req: Request, res: Response) {
    res.json(await ProductoService.list(res.locals.query));
  },
  async get(_req: Request, res: Response) {
    res.json(await ProductoService.get(res.locals.params.id));
  },
  async create(_req: Request, res: Response) {
    const producto = await ProductoService.create(res.locals.body);
    res.status(201).location(`/api/productos/${producto.id}`).json(producto);
  },
  async update(_req: Request, res: Response) {
    res.json(await ProductoService.update(res.locals.params.id, res.locals.body));
  },
  async remove(_req: Request, res: Response) {
    await ProductoService.remove(res.locals.params.id);
    res.status(204).end();
  },
};
