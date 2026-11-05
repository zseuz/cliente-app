import { Request, Response, Router } from 'express';
import { ZodTypeAny } from 'zod';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/async-handler';
import { PaginationQuerySchema } from '../utils/pagination';
import { IdParamSchema } from '../validators/common.validator';

type Action = (req: Request, res: Response) => Promise<void>;

interface CrudController {
  list: Action;
  get: Action;
  create: Action;
  update: Action;
  remove: Action;
}

/** Genera las 5 rutas REST estándar con validación de params, query y body. */
export function crudRouter(controller: CrudController, bodySchema: ZodTypeAny, querySchema: ZodTypeAny = PaginationQuerySchema): Router {
  const router = Router();
  const byId = validate(IdParamSchema, 'params');

  router.get('/', validate(querySchema, 'query'), asyncHandler(controller.list));
  router.get('/:id', byId, asyncHandler(controller.get));
  router.post('/', validate(bodySchema), asyncHandler(controller.create));
  router.put('/:id', byId, validate(bodySchema), asyncHandler(controller.update));
  router.delete('/:id', byId, asyncHandler(controller.remove));

  return router;
}
