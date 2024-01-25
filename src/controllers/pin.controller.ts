import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Pin } from '../models/pin.model';

export const controller = {
  add: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, product } = body;

      const doc = await Pin.create({ product, pinnedBy: userId });

      if (!doc) throw new Error('Unable to create doc');

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Product added to pinned',
        data: doc,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  remove: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { productId } = params;

      const doc = await Pin.findOneAndDelete({ product: productId });
      if (!doc) throw new Error('Unable to delete pinned product');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Pinned product deleted',
        data: doc,
      });
    } catch (error) {
      return response({
        type: 'ERROR',
        code: 500,
        message: (error as Error).message,
      });
    }
  },

  get: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = params;

      const docs = await Pin.find({ pinnedBy: userId }).populate(
        'pinnedBy product'
      );

      if (!docs || docs.length === 0)
        throw new Error('No pinned products found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: `Found ${docs.length} pinned products`,
        data: docs,
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
