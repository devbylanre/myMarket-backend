import { Request, Response, query } from 'express';
import crypto from 'crypto';
import { Product } from '../models/product.model';
import { useResponse } from '../lib/useResponse';
import { useFirebase } from '../lib/useFirebase';
import { SortOrder } from 'mongoose';

export const controller = {
  create: async ({ body, files }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { uploadFile, fileName, getUrl } = useFirebase();

    try {
      // Check if at least one file was uploaded
      if (!files || files.length === 0)
        throw new Error('No image was uploaded');

      // upload images
      const images = await Promise.all(
        (files as Express.Multer.File[]).map(async (file, id) => {
          try {
            const name = fileName(file.originalname, 'image');
            const image = await uploadFile(
              file.buffer,
              name,
              'products/images'
            );
            const url = await getUrl(image.ref);

            return { name, url };
          } catch (error) {
            throw new Error(
              `Error uploading images: ${(error as Error).message}`
            );
          }
        })
      );

      // If file was uploaded, create a new product
      const product = await Product.create({
        ...body,
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
    const { productId } = params;

    try {
      // Find a product
      const product = await Product.findById(productId);
      if (!product) throw new Error('Unable to find product');

      const newProduct = await Product.findByIdAndUpdate(
        productId,
        { views: product.views + 1 },
        { new: true }
      ).populate('postedBy', '-password');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Product fetched successfully',
        data: newProduct,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  getAll: async ({ query }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { populate, limit, category, sortBy, minPrice, maxPrice, sortOrder } =
      query;

    try {
      // Check if sortBy is valid
      const validSortFields = ['title', 'price', 'discount'];
      if (sortBy && !validSortFields.includes(sortBy as string))
        throw new Error('Invalid sort field');

      // Check if sortOrder is valid
      const validSortOrder = ['asc', 'desc'];
      if (sortOrder && !validSortOrder.includes(sortOrder as string))
        throw new Error('Invalid sort order');

      // Build the sort query
      const sort: { [key: string]: SortOrder } = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Build the product query
      const buildQuery = () => {
        const query: { [key: string]: string | {} } = {};
        const min = parseInt(minPrice as string);
        const max = parseInt(maxPrice as string);
        const cat = category as string;

        switch (true) {
          case min > 0 && max > 0:
            query.price = { $gte: min, $lte: max };
            break;
          case min > 0:
            query.price = { $gte: min };
            break;
          case max > 0:
            query.price = { $lte: max };
            break;
        }

        if (category) query.category = cat;

        return query;
      };

      // Find all product
      const products = await Product.find(buildQuery())
        .populate(`${populate}`, '-password')
        .limit(parseInt(limit as string) || 10)
        .sort(sort);

      // Check if at least one product was found
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

  getForUser: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { userId } = params;

    try {
      // Find user product
      const products = await Product.find({ postedBy: userId });

      if (!products || products.length === 0)
        throw new Error('We could not find any products');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: `Found ${products.length} products`,
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
    const { productId } = params;
    const { userId } = body;

    try {
      // Find product
      const product = await Product.findByIdAndUpdate(productId, body, {
        new: true,
      });
      if (!product) throw new Error('Unable to find and update product');

      // Check if product author is making this request
      if (userId !== product.postedBy.toString())
        throw new Error('You cannot update this product');

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

  delete: async ({ params, body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { deleteFile } = useFirebase();
    const { productId } = params;
    const { userId } = body;

    try {
      // Find a product
      const product = await Product.findById(productId);
      if (!product) throw new Error('Unable to find product');

      // Check if product author is making this request
      if (userId !== product.postedBy.toString())
        throw new Error('You cannot delete this product');

      // Delete images
      const deleteImages = await Promise.all(
        product.images.map(async (image) => {
          try {
            await deleteFile(image.name, 'products/images');
          } catch (error) {
            throw new Error(
              `Unable to delete images: ${(error as Error).message}`
            );
          }
        })
      );

      // Delete the product
      const deleteProduct = await Product.findByIdAndDelete(productId);

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Product deleted successfully',
        data: deleteProduct,
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
