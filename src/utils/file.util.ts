import path from 'path';
import { FileFilterCallback } from 'multer';

export const useFile = (
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  const isImage = () => {
    const types = ['jpeg', 'jpg', 'png'];
    const extension = path.extname(file.originalname).toLowerCase();
    const isTypeValid = types.includes(extension);

    if (isTypeValid) {
      return callback(null, true);
    }

    return callback(
      new Error(
        'Invalid file extension. Only jpeg, jpg, and png images are allowed'
      )
    );
  };

  return { isImage };
};

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
