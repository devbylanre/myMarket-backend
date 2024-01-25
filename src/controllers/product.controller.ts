import { Request, Response } from 'express';
import { Product } from '../models/product.model';
import { useResponse } from '../lib/useResponse';
import { useFirebase } from '../lib/useFirebase';

export default {
  create: async ({ body, files }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { uploadFile, fileName, getUrl } = useFirebase();

    try {
      if (!files || files.length === 0)
        throw new Error('No image was uploaded');

      const images = await Promise.all(
        (files as Express.Multer.File[]).map(async (file) => {
          try {
            const name = fileName(file.originalname, 'product');
            const image = await uploadFile(file.buffer, name, 'products/');
            const url = getUrl(image.ref);

            return { image, url };
          } catch (error) {
            throw new Error(
              `Error uploading images: ${(error as Error).message}`
            );
          }
        })
      );

      const product = await Product.create({
        ...body,
        user: body.userId,
        images,
      });

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  getOne: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { productId } = params;
      const product = await Product.findById(productId).populate(
        'user',
        '-otp -verification -password'
      );

      if (!product) throw new Error('Unable to find product');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Product fetched successfully',
        data: product,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  getAll: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const products = await Product.find(params).populate(
        'user',
        '-otp -verification -password'
      );

      if (!products || products.length === 0)
        throw new Error('No product was found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Products fetched successfully',
        data: products,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  update: async ({ body, params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { productId } = params;

      const product = await Product.findByIdAndUpdate(productId, body, {
        new: true,
      });
      if (!product) throw new Error('Unable to find and update product');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Product updated successfully',
        data: body,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  delete: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { deleteFile } = useFirebase();

    try {
      const { productId } = params;

      const product = await Product.findById(productId);
      if (!product) throw new Error('Unable to find product');

      const deleteImages = await Promise.all(
        product.images.map(async (image) => {
          try {
            await deleteFile(image.name, '/products');
          } catch (error) {
            throw new Error(
              `Unable to delete images: ${(error as Error).message}`
            );
          }
        })
      );

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Product deleted successfully',
        data: product,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },
};
