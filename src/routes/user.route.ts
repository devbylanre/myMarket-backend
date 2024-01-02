import { Request, Response, Router } from 'express';
import { controller } from '../controllers/user.controller';
import { rules, validate } from '../validations/user.validation';
import { fileUtil } from '../utils/file.util';
import multer from 'multer';

const userRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_, file, callback) {
    fileUtil.isImage(file, callback);
  },
});

const routes = {
  create: userRouter.post(
    '/create',
    [...rules.create, validate],
    (req: Request, res: Response) => controller.create(req, res)
  ),

  authenticate: userRouter.post(
    '/auth',
    [...rules.authentication, validate],
    (req: Request, res: Response) => controller.authenticate(req, res)
  ),

  verify: userRouter.get(
    '/verify',
    [...rules.verify, validate],
    (req: Request, res: Response) => controller.verify(req, res)
  ),

  fetch: userRouter.get(
    '/:id',
    [...rules.fetch, validate],
    (req: Request, res: Response) => controller.fetch(req, res)
  ),

  fetchProducts: userRouter.get(
    '/products/:id',
    [...rules.fetchProducts, validate],
    (req: Request, res: Response) => controller.fetchProducts(req, res)
  ),

  update: userRouter.put(
    '/:id',
    [...rules.update, validate],
    (req: Request, res: Response) => controller.update(req, res)
  ),

  photoUpload: userRouter.post(
    '/photo/upload',
    [...rules.photoUpload, validate],
    upload.single('photo'),
    (req: Request, res: Response) => controller.uploadPhoto(req, res)
  ),

  verifyEmail: userRouter.post(
    '/email/verify',
    [...rules.verifyEmail, validate],
    (req: Request, res: Response) => controller.verifyEmail(req, res)
  ),

  changeEmail: userRouter.post(
    '/email/change',
    [...rules.changeEmail, validate],
    (req: Request, res: Response) => controller.changeEmail(req, res)
  ),

  changePassword: userRouter.post(
    '/password/change',
    validate,
    (req: Request, res: Response) => controller.changePassword(req, res)
  ),

  generateOTP: userRouter.post(
    '/otp/generate',
    [...rules.generateOTP, validate],
    (req: Request, res: Response) => controller.generateOTP(req, res)
  ),

  verifyOTP: userRouter.post(
    '/otp/verify',
    [...rules.verifyOTP, validate],
    (req: Request, res: Response) => controller.verifyOTP(req, res)
  ),
};

export default userRouter;
