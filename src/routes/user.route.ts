import { Request, Response, Router } from 'express';
import { controller } from '../controllers/user.controller';
import { validate } from '../validations/user.validation';
import { fileUtil } from '../utils/file.util';
import multer from 'multer';

const userRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(req, file, callback) {
    fileUtil.isImage(file, callback);
  },
});

const routes = {
  create: userRouter.post(
    '/create',
    validate.create,
    (req: Request, res: Response) => controller.create(req, res)
  ),

  emailVerification: userRouter.put(
    '/verification/email',
    validate.emailVerification,
    (req: Request, res: Response) => controller.emailVerification(req, res)
  ),

  verification: userRouter.get(
    '/verify/email',
    validate.verification,
    (req: Request, res: Response) => controller.verification(req, res)
  ),

  authenticate: userRouter.post(
    '/auth',
    validate.authenticate,
    (req: Request, res: Response) => controller.authenticate(req, res)
  ),

  update: userRouter.put(
    '/update/:id',
    validate.update,
    (req: Request, res: Response) => controller.update(req, res)
  ),

  fetch: userRouter.get(
    '/fetch/:id',
    validate.fetch,
    (req: Request, res: Response) => controller.fetch(req, res)
  ),

  fetchProducts: userRouter.get(
    '/fetch/products/:id',
    validate.fetchProducts,
    (req: Request, res: Response) => controller.fetchProducts(req, res)
  ),

  createOTP: userRouter.put(
    '/create/otp/:id',
    validate.createOTP,
    (req: Request, res: Response) => controller.createOTP(req, res)
  ),

  verifyOTP: userRouter.get(
    '/verify/otp/:id',
    validate.verifyOTP,
    (req: Request, res: Response) => controller.verifyOTP(req, res)
  ),

  changePassword: userRouter.put(
    '/change/password/',
    validate.changePassword,
    (req: Request, res: Response) => controller.changePassword(req, res)
  ),

  changeEmail: userRouter.put(
    '/change/email/:id',
    validate.changeEmail,
    (req: Request, res: Response) => controller.changeEmail(req, res)
  ),

  uploadPhoto: userRouter.put(
    '/upload/photo/:id',
    validate.uploadPhoto,
    upload.single('photo'),
    (req: Request, res: Response) => controller.uploadPhoto(req, res)
  ),
};

export default userRouter;
