import { Request, Response, Router } from 'express';
import { controller } from '../controllers/product.controller';
import multer from 'multer';
import { auth } from '../middlewares/auth.middleware';
import { rules, validate } from '../validations/product.validation';

const productRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

const routes = {
  create: productRouter.post(
    '/create',
    auth.user,
    [...rules.create, validate],
    upload.array('images'),
    (req: Request, res: Response) => {
      controller.create(req, res);
    }
  ),

  update: productRouter.put(
    '/update/:id',
    auth.user,
    [...rules.update, validate],
    (req: Request, res: Response) => {
      controller.update(req, res);
    }
  ),

  delete: productRouter.delete(
    '/delete/:id',
    auth.user,
    [rules.delete, validate],
    (req: Request, res: Response) => {
      controller.delete(req, res);
    }
  ),

  fetch: productRouter.get(
    '/fetch/single/:id',
    auth.user,
    [rules.fetch, validate],
    (req: Request, res: Response) => controller.fetch(req, res)
  ),

  fetchAll: productRouter.get('/fetch/all', (req: Request, res: Response) =>
    controller.fetchAll(req, res)
  ),
};

export default productRouter;
