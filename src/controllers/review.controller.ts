import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Review } from '../models/review.model';

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, ...payload } = body;
      const doc = await Review.create({ ...payload, user: userId });

      if (!doc) throw new Error('Unable to create review');

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Review submitted successfully',
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

  delete: async ({ params }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { docId } = params;
      const doc = await Review.findByIdAndDelete(docId);

      if (!doc) throw new Error('Unable to delete review');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Review deleted',
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
      const { productId } = params;

      const docs = await Review.find({ product: productId });
      if (!docs || docs.length === 0) throw new Error('Unable to find review');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Found review successfully',
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
