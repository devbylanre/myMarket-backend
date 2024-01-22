import { Request, Response, Router } from 'express';
import multer from 'multer';

const productRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// const routes = {
//   create: productRouter.post(
//     '/create',
//     auth.user,
//     upload.array('images'),
//     (req: Request, res: Response) => {
//       controller.create(req, res);
//     }
//   ),

//   update: productRouter.put(
//     '/:id',
//     [...rules.update, validate],
//     auth.user,
//     (req: Request, res: Response) => {
//       controller.update(req, res);
//     }
//   ),

//   delete: productRouter.delete(
//     '/:id',
//     auth.user,
//     [...rules.delete, validate],
//     (req: Request, res: Response) => {
//       controller.delete(req, res);
//     }
//   ),

//   fetch: productRouter.get(
//     '/:id',
//     auth.user,
//     [...rules.fetch, validate],
//     (req: Request, res: Response) => controller.fetch(req, res)
//   ),

//   fetchAll: productRouter.get('/', (req: Request, res: Response) =>
//     controller.fetchAll(req, res)
//   ),
// };

export default productRouter;
