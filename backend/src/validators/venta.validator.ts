import { z } from 'zod';
import { PaginationQuerySchema } from '../utils/pagination';
import { optionalText } from './common.validator';

export const VentaSchema = z.object({
  vendedorId: z.coerce.number().int().positive('Seleccione un vendedor'),
  productoId: z.coerce.number().int().positive('Seleccione un producto'),
  cantidad: z.coerce.number().int('La cantidad debe ser entera').positive('La cantidad debe ser mayor a 0'),
  fecha: z.coerce
    .date()
    .refine((d) => d.getTime() <= Date.now() + 60_000, 'La fecha no puede estar en el futuro')
    .optional(),
  observaciones: optionalText(255),
});

export const VentaQuerySchema = PaginationQuerySchema.extend({
  vendedorId: z.coerce.number().int().positive().optional(),
  productoId: z.coerce.number().int().positive().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
});
