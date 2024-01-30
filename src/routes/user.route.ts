import { Router } from 'express';
import { useUpload } from '../lib/useUpload';
import { useValidate } from '../lib/useValidate';
import {
  changeUserEmail,
  changeUserPassword,
  getUser,
  updateUser,
  uploadUserPhoto,
} from '../controllers/user.controller';
import { useAuthorization } from '../middlewares/useAuthorization';
import {
  changeEmailRoute,
  changePasswordRoute,
  getUserRoute,
  updateUserRoute,
  uploadPhotoRoute,
} from '../validations/user.validation';

const userRouter = Router();

const { configure } = useUpload();
const { validate } = useValidate();

const upload = configure({ fileSize: 2 * 1024 * 1024, files: 1 });

// Use authorization middleware
const { authorize } = useAuthorization();
userRouter.use(authorize);

userRouter.get('/', validate(getUserRoute), getUser);
userRouter.patch('/', validate(updateUserRoute), updateUser);
userRouter.post(
  '/upload',
  validate(uploadPhotoRoute),
  upload.single('photo'),
  uploadUserPhoto
);
userRouter.post('/change-email', validate(changeEmailRoute), changeUserEmail);
userRouter.post(
  '/change-password',
  validate(changePasswordRoute),
  changeUserPassword
);

export default userRouter;
