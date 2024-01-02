import { validationResult } from 'express-validator';
import { handleResponse } from '../utils/res.util';
import { Request, Response } from 'express';
import { IProduct, Product } from '../models/product.model';
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
import mongoose from 'mongoose';

const firebaseApp = initializeApp(config.firebase);
const storage = getStorage(firebaseApp);

export const controller = {
  create: async (req: IAuthRequest, res: Response) => {
    try {
      const data = req.body;
      const images = req.files as Express.Multer.File[];

      if (!images) {
        return handleResponse.error({
          res: res,
          status: 400,
          message: 'At least one image is required to create a product',
        });
      }

      const uploadedImages: { name: string; url: string }[] = [];

      const uploadImages = images!.map(async (file: Express.Multer.File) => {
        const encrypted = `${
          path.parse(file.originalname).name
        }-${Date.now().toString()}${path.extname(file.originalname)}`;

        const fileRef = ref(storage, `products/images/${encrypted}`);
        await uploadBytes(fileRef, file.buffer);

        const imageUrl = await getDownloadURL(fileRef);

        uploadedImages.push({ name: encrypted, url: imageUrl });
      });

      await Promise.all(uploadImages);

      const product = await Product.create({
        ...data,
        images: uploadedImages,
        user: req.user,
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
      const { id } = req.params;

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

  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (!product) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'Product not found',
        });
      }

      const deleteImages = product.images.map(async (image) => {
        const imageRef = ref(storage, `products/images/${image.name}`);
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

  fetch: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const product = await Product.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'seller',
          },
        },
      ]);

      if (!product || product.length === 0) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'Product not found',
        });
      }

      const seller = product[0].seller[0];
      const { password, verification, otp, ...sellerData } = seller;

      const { seller: _, ...productData } = product[0];

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Product fetched successfully',
        data: { ...productData, seller: { ...sellerData } },
      });
    } catch (error: any) {
      return handleResponse.error({
        res: res,
        status: 500,
        message: error.message,
      });
    }
  },

  fetchAll: async (req: Request, res: Response) => {
    try {
      const products = await Product.find();

      if (!products || products.length < 1) {
        return handleResponse.error({
          res: res,
          status: 404,
          message: 'No product was found',
        });
      }

      return handleResponse.success({
        res: res,
        status: 200,
        message: 'Products fetched successfully',
        data: products,
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
