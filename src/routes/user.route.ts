import { Router } from 'express';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import controller from '../controllers/user.controller';
import { Rules } from '../validations/user.validation';

const userRouter = Router();

const { configure } = useUpload();
const { validate } = useValidate();

const upload = configure({ fileSize: 2 * 1024 * 1024, files: 1 });

// Verify user
userRouter.post('/verify', validate(Rules.verify), controller.verify);

// Get user
userRouter.get('/get', validate(Rules.get), controller.get);

// Update user
userRouter.patch('/update', validate(Rules.update), controller.update);

// Upload photo
userRouter.post(
  '/upload',
  validate(Rules.uploadPhoto),
  upload.single('photo'),
  controller.uploadPhoto
);

// Change email
userRouter.post(
  '/:userId/change-email',
  validate(Rules.changeEmail),
  controller.changeEmail
);

// Change password
userRouter.post(
  '/:userId/change-password',
  validate(Rules.changePassword),
  controller.changePassword
);

export default userRouter;
