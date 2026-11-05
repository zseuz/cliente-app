import { z } from 'zod';
import { optionalText } from './common.validator';

export const VendedorSchema = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
  apellido: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().trim().toLowerCase().email('Email inválido').max(150),
  telefono: optionalText(20).refine((v) => v === null || /^[0-9+\-\s()]{7,20}$/.test(v), 'Teléfono inválido'),
  activo: z.boolean().optional(),
});
