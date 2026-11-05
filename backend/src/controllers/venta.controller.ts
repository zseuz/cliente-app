import { Request, Response } from 'express';
import { VentaService } from '../services/venta.service';

export const VentaController = {
  async list(_req: Request, res: Response) {
    res.json(await VentaService.list(res.locals.query));
  },
  async get(_req: Request, res: Response) {
    res.json(await VentaService.get(res.locals.params.id));
  },
  async create(_req: Request, res: Response) {
    const venta = await VentaService.create(res.locals.body);
    res.status(201).location(`/api/ventas/${venta.id}`).json(venta);
  },
  async update(_req: Request, res: Response) {
    res.json(await VentaService.update(res.locals.params.id, res.locals.body));
  },
  async remove(_req: Request, res: Response) {
    await VentaService.remove(res.locals.params.id);
    res.status(204).end();
  },
};
