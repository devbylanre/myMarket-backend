import { Request, Response, Router } from 'express';
import { rules, validate } from '../validations/user.validation';
import { fileUtil } from '../utils/file.util';
import multer from 'multer';

import { createUser } from '../controllers/user.controller';

const userRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter(_, file, callback) {
    fileUtil.isImage(file, callback);
  },
});

userRouter.post('/create', (req, res) => createUser(req, res));

export default userRouter;
