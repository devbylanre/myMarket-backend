import { Request, Response, Router } from 'express';
import { rules } from '../validations/user.validation';
import { useUpload } from '../lib/useUpload';

import { createUser } from '../controllers/user.controller';

const userRouter = Router();

const { upload } = useUpload();

userRouter.post('/create', (req, res) => createUser(req, res));

export default userRouter;
