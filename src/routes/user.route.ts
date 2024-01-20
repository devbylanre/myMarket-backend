import { Request, Response, Router } from 'express';
import { rules, validate } from '../validations/user.validation';
import { fileUtil } from '../utils/file.util';
import multer from 'multer';

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

export default userRouter;
