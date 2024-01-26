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

// Get user
userRouter.get('/:userId/get', authorize, validate(Rules.get), controller.get);

// Verify user
userRouter.get('/', validate(Rules.verify), controller.verify);

// Update user
userRouter.patch(
  '/:userId/update',
  authorize,
  validate(Rules.update),
  controller.update
);

// Upload photo
userRouter.post(
  '/:userId/upload',
  authorize,
  upload.single('photo'),
  validate(Rules.uploadPhoto),
  controller.uploadPhoto
);

// Change email
userRouter.post(
  '/:userId/email/change',
  validate(Rules.changeEmail),
  controller.changeEmail
);

// Change password
userRouter.post(
  '/:userId/password/change',
  validate(Rules.changePassword),
  controller.changePassword
);

export default userRouter;
