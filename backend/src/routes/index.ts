import { Router } from 'express';
import { pool } from '../config/database';
import { ProductoController } from '../controllers/producto.controller';
import { VendedorController } from '../controllers/vendedor.controller';
import { VentaController } from '../controllers/venta.controller';
import { asyncHandler } from '../utils/async-handler';
import { ProductoSchema } from '../validators/producto.validator';
import { VendedorSchema } from '../validators/vendedor.validator';
import { VentaQuerySchema, VentaSchema } from '../validators/venta.validator';
import { crudRouter } from './crud.router';

export const apiRouter = Router();

apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up', time: new Date().toISOString() });
  }),
);

apiRouter.use('/vendedores', crudRouter(VendedorController, VendedorSchema));
apiRouter.use('/productos', crudRouter(ProductoController, ProductoSchema));
apiRouter.use('/ventas', crudRouter(VentaController, VentaSchema, VentaQuerySchema));
