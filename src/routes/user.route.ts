import { Request, Response, Router } from 'express';
import { rules } from '../validations/user.validation';
import { useUpload } from '../lib/useUpload';

import { createUser } from '../controllers/user.controller';
import { useValidate } from '../lib/useValidate';
import { NextFunction } from 'express-serve-static-core';

const userRouter = Router();

// hooks
const { upload } = useUpload();
const { validate } = useValidate();

userRouter.post(
  '/create',
  rules.create,
  validate,
  (req: Request, res: Response, next: NextFunction) => {
    createUser(req, res);
  }
);

export default userRouter;
