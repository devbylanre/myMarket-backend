import { Request, Response, Router } from 'express';
import { controller } from '../controllers/product.controller';
import multer from 'multer';
import { fileUtil } from '../utils/file.util';
import { auth } from '../middlewares/auth.middleware';

const productRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    fileUtil.isImage(file, cb);
  },
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

  update: productRouter.put('/update/:id', (req: Request, res: Response) => {
    controller.update(req, res);
  }),

  delete: productRouter.delete('/delete/:id', (req: Request, res: Response) => {
    controller.delete(req, res);
  }),
};

export default productRouter;
