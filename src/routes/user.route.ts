import { Request, Response, Router } from 'express';
import { controller } from '../controllers/user.controller';
import { validate } from '../validations/user.validation';

const userRouter = Router();

const routes = {
  create: userRouter.post(
    '/create',
    validate.create,
    (req: Request, res: Response) => controller.create(req, res)
  ),

  verify: userRouter.put(
    '/verify/token/:token',
    (req: Request, res: Response) => controller.verify(req, res)
  ),

  authenticate: userRouter.post(
    '/auth',
    validate.authenticate,
    (req: Request, res: Response) => controller.authenticate(req, res)
  ),

  update: userRouter.put(
    '/update/:id',
    validate.paramMongoID,
    (req: Request, res: Response) => controller.update(req, res)
  ),

  fetch: userRouter.get(
    '/fetch/:id',
    validate.paramMongoID,
    (req: Request, res: Response) => controller.fetch(req, res)
  ),

  createOTP: userRouter.put(
    '/create/otp/:id',
    validate.paramMongoID,
    (req: Request, res: Response) => controller.createOTP(req, res)
  ),

  verifyOTP: userRouter.get(
    '/verify/otp/:id',
    validate.verifyOTP,
    (req: Request, res: Response) => controller.verifyOTP(req, res)
  ),

  verifyEmail: userRouter.get(
    '/verify/email',
    validate.verifyEmail,
    (req: Request, res: Response) => controller.verifyEmail(req, res)
  ),

  changePassword: userRouter.put(
    '/change/password/:id',
    validate.paramMongoID,
    (req: Request, res: Response) => controller.changePassword(req, res)
  ),

  changeEmail: userRouter.put(
    '/change/password',
    (req: Request, res: Response) => controller.changeEmail(req, res)
  ),
};

export default userRouter;
