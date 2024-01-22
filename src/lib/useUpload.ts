import path from 'path';
import multer, { FileFilterCallback } from 'multer';

export const useUpload = () => {
  const isImage = (file: Express.Multer.File, callback: FileFilterCallback) => {
    const types = ['.jpeg', '.jpg', '.png'];
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

  const configure = (limits: multer.Options['limits']) => {
    return multer({
      storage: multer.memoryStorage(),
      limits: limits,
      fileFilter: (_, file, callback) => isImage(file, callback),
    });
  };

  return { configure };
};
