import { validationResult } from 'express-validator';
import { handleResponse } from '../utils/res.util';
import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import { IAuthRequest } from '../middlewares/auth.middleware';

// firebase
import { initializeApp } from 'firebase/app';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

// config file
import { config } from '../config';
import path from 'path';

const firebaseApp = initializeApp(config.firebase);
const storage = getStorage(firebaseApp);

export const controller = {
  create: async (req: IAuthRequest, res: Response) => {
    try {
      const data = req.body;
      const id = req.user;
      const images = req.files as Express.Multer.File[];

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: errors.array(),
        });
      }

      if (!images || Array.from(images).length < 1) {
        return handleResponse.error({
          res: res,
          status: 400,
          message: 'At least one image is required to create a product',
        });
      }

      const uploadedImages: { name: string; url: string }[] = [];

      const uploadImages = images!.map(async (file: Express.Multer.File) => {
        const encrypted =
          file.filename + Date.now() + path.extname(file.originalname);

        const fileRef = ref(storage, `products/images/${encrypted}`);
        await uploadBytes(fileRef, file.buffer);

        const imageUrl = await getDownloadURL(fileRef);

        uploadedImages.push({ name: encrypted, url: imageUrl });
      });

      await Promise.all(uploadImages);

      const product = await Product.create({
        ...data,
        images: uploadedImages,
        seller: id,
      });

      return handleResponse.success({
        res: res,
        status: 201,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  update: async (req: IAuthRequest, res: Response) => {
    try {
      const data = req.body;
      const id = req.user;

      const product = await Product.findByIdAndUpdate(id, data);

      if (!product) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'Product not found',
        });
      }

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Product updated successfully',
        data: data,
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  deleteProduct: async (req: IAuthRequest, res: Response) => {
    try {
      const id = req.user;

      const product = await Product.findById(id);

      if (!product) {
        return handleResponse.error({
          res: res,
          status: 401,
          message: 'Product not found',
        });
      }

      const deleteImages = product.images.map(async (image) => {
        const imageRef = ref(storage, `product/images/${image.name}`);
        await deleteObject(imageRef);
      });

      await Promise.all(deleteImages);

      await Product.findByIdAndDelete(product._id);

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Product deleted successfully',
        data: { _id: product._id, title: product.title },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },
};
