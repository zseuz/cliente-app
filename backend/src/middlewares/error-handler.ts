import { ErrorRequestHandler, RequestHandler } from 'express';
import { DatabaseError } from 'pg';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http-error';
import { logger } from '../utils/logger';

/** Mensajes legibles para restricciones conocidas del esquema. */
const CONSTRAINT_MESSAGES: Record<string, string> = {
  ux_vendedor_email: 'Ya existe un vendedor con ese email',
  ux_producto_codigo: 'Ya existe un producto con ese código',
  venta_vendedor_id_fkey: 'El vendedor tiene ventas asociadas o no existe',
  venta_producto_id_fkey: 'El producto tiene ventas asociadas o no existe',
  producto_stock_check: 'Stock insuficiente',
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(HttpError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, ...(err.details ? { details: err.details } : {}) });
  }

  if (err instanceof DatabaseError) {
    const message = (err.constraint && CONSTRAINT_MESSAGES[err.constraint]) || err.detail || err.message;
    switch (err.code) {
      case '23505': // unique_violation
      case '23503': // foreign_key_violation
        return res.status(409).json({ message });
      case '23514': // check_violation
      case '22P02': // invalid_text_representation
        return res.status(400).json({ message });
    }
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON mal formado' });
  }

  logger.error(`${req.method} ${req.originalUrl}`, err);
  return res.status(500).json({ message: 'Error interno del servidor' });
};
