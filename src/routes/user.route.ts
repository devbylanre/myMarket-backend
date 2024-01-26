import { Router } from 'express';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import controller from '../controllers/user.controller';
import { Rules } from '../validations/user.validation';
import { useAuthorization } from '../middlewares/useAuth';

const userRouter = Router();

const { configure } = useUpload();
const { validate } = useValidate();
const { authorize } = useAuthorization();

const upload = configure({ fileSize: 2 * 1024 * 1024 });

// Create new user
userRouter.post('/create', validate(Rules.create), controller.create);

//  Authenticate user
userRouter.post('/auth', validate(Rules.authenticate), controller.authenticate);

// Verify user
userRouter.post('/verify', validate(Rules.verify), controller.verify);

// Get user
userRouter.get('/get', authorize, validate(Rules.get), controller.get);

// Update user
userRouter.patch(
  '/update',
  authorize,
  validate(Rules.update),
  controller.update
);

// Upload photo
userRouter.post(
  '/upload',
  authorize,
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
