import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

type Source = 'body' | 'query' | 'params';

/**
 * Valida y normaliza `req[source]` con un esquema Zod. El resultado tipado
 * queda en `res.locals[source]` (req.query es de solo lectura en Express 5).
 * Los ZodError se transforman en 400 en el error handler.
 */
export const validate =
  (schema: ZodTypeAny, source: Source = 'body'): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    res.locals[source] = result.data;
    next();
  };
