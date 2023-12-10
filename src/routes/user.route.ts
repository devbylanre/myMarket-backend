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

userRouter.put('/update/:id', (req: Request, res: Response) =>
  controller.updateUser(req, res)
);

export default userRouter;
