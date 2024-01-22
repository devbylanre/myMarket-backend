import { Router } from 'express';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import { rules } from '../validations/user.validation';
import {
  authenticateUser,
  createUser,
  getUser,
  updateUser,
  uploadPhoto,
  verifyUserEmail,
} from '../controllers/user.controller';

const userRouter = Router();

// hooks
const { configure } = useUpload();
const { validate } = useValidate();

const upload = configure({ fileSize: 2 * 1024 * 1024 });

userRouter.post('/create', rules.create, validate, createUser);

userRouter.post('/auth', rules.authenticate, validate, authenticateUser);

userRouter.get('/:id', rules.get, validate, getUser);

userRouter.patch('/:id', rules.update, validate, updateUser);

userRouter.post('/email/verify', rules.verifyEmail, validate, verifyUserEmail);

userRouter.post('/:id/photo/upload', upload.single('photo'), uploadPhoto);

export default userRouter;
