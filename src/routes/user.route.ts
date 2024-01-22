import { Router } from 'express';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import { rules } from '../validations/user.validation';
import { authenticateUser, createUser } from '../controllers/user.controller';

const userRouter = Router();

// hooks
const { upload } = useUpload();
const { validate } = useValidate();

userRouter.post('/create', rules.create, validate, createUser);

userRouter.post('/auth', rules.authentication, validate, authenticateUser);

export default userRouter;
