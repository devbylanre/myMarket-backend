import { Request, Response, Router } from 'express';
import { controller } from '../controllers/product.controller';
import multer from 'multer';
import { fileUtil } from '../utils/file.util';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../validations/product.validation';

const productRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

const routes = {
  create: productRouter.post(
    '/create',
    auth.user,
    upload.array('images'),
    (req: Request, res: Response) => {
      controller.create(req, res);
    }
  ),

  update: productRouter.put(
    '/update/:id',
    auth.user,
    validate.update,
    (req: Request, res: Response) => {
      controller.update(req, res);
    }
  ),

  delete: productRouter.delete(
    '/delete/:id',
    auth.user,
    validate.delete,
    (req: Request, res: Response) => {
      controller.delete(req, res);
    }
  ),

  fetch: productRouter.get(
    '/fetch/:id',
    auth.user,
    validate.fetch,
    (req: Request, res: Response) => controller.fetch(req, res)
  ),
};

export default productRouter;
