import { Router } from 'express';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import { rules } from '../validations/user.validation';
import { controller } from '../controllers/user.controller';

const userRouter = Router();

// hooks
const { configure } = useUpload();
const { validate } = useValidate();

const upload = configure({ fileSize: 2 * 1024 * 1024 });

userRouter.post('/create', rules.create, validate, controller.create);

userRouter.post('/auth', rules.authenticate, validate, controller.authenticate);

userRouter.get('/:id', rules.get, validate, controller.get);

userRouter.patch('/:id', rules.update, validate, controller.update);

userRouter.post(
  '/email/verify',
  rules.verifyEmail,
  validate,
  controller.emailVerification
);

userRouter.post(
  '/photo/upload',
  upload.single('photo'),
  validate,
  controller.uploadPhoto
);

userRouter.post('/email/change', validate, controller.changeEmail);

userRouter.post('password/change', validate, controller.changePassword);

userRouter.post('/otp/gen', validate, controller.generateOneTimePassword);

userRouter.post('otp/gen', validate, controller.verifyOneTimePassword);

userRouter.post('/follow');

export default userRouter;
