import { Request, Response, Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserValidation } from '../validations/user.validation';

const controller = new UserController();
const validate = new UserValidation();

const userRouter = Router();

userRouter.post(
  '/create',
  validate.createUser(),
  (req: Request, res: Response) => {
    controller.createUser(req, res);
  }
);

userRouter.post('/auth', validate.authUser(), (req: Request, res: Response) =>
  controller.authUser(req, res)
);

userRouter.put(
  '/update/:id',
  validate.updateUser(),
  (req: Request, res: Response) => controller.updateUser(req, res)
);

userRouter.get(
  '/fetch/:id',
  validate.paramID(),
  (req: Request, res: Response) => controller.fetchUser(req, res)
);

userRouter.put(
  '/token/gen/:id',
  validate.paramID(),
  (req: Request, res: Response) => controller.generateToken(req, res)
);

userRouter.put(
  '/token/verify/:id',
  validate.verifyToken(),
  (req: Request, res: Response) => controller.verifyToken(req, res)
);

userRouter.put(
  '/reset/password/:id',
  validate.resetPassword(),
  (req: Request, res: Response) => controller.resetPassword(req, res)
);

userRouter.put(
  '/change/email/:id',
  validate.changeEmail(),
  (req: Request, res: Response) => controller.changeEmail(req, res)
);

userRouter.put(
  '/change/mobile/:id',
  validate.changeMobile(),
  (req: Request, res: Response) => controller.changeMobile(req, res)
);

export default userRouter;
