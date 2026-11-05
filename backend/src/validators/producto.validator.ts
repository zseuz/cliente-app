import { z } from 'zod';
import { optionalText } from './common.validator';

export const ProductoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[A-Za-z0-9\-_]+$/, 'Solo letras, números, guion y guion bajo'),
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres').max(150),
  descripcion: optionalText(1000),
  precio: z.coerce.number().nonnegative('El precio no puede ser negativo').multipleOf(0.01, 'Máximo 2 decimales').max(9_999_999_999),
  stock: z.coerce.number().int('El stock debe ser entero').nonnegative('El stock no puede ser negativo'),
  activo: z.boolean().optional(),
});
