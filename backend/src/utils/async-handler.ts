import { NextFunction, Request, RequestHandler, Response } from 'express';

/** Propaga al error handler las promesas rechazadas de los controladores (Express 4). */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
