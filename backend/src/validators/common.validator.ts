import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'El id debe ser un entero positivo' }),
});

/** Convierte '' en undefined/null para campos opcionales que vienen de formularios. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));
