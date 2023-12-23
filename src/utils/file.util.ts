import path from 'path';
import { FileFilterCallback } from 'multer';

export const fileUtil = {
  isImage: (file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowedTypes.test(fileExt);

    if (isAllowed) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
};
