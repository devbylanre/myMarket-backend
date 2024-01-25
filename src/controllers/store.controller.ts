import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Store } from '../models/store.model';

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { name, userId, ...payload } = body;

      const doc = await Store.findByIdAndUpdate(
        userId,
        { name, ...payload, reference: userId },
        { upsert: true, new: true }
      );

      if (!doc) throw new Error('Could not find Store');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Store created successfully',
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
      const { reference } = params;

      const doc = await Store.findOne({ reference: reference });
      if (!doc) throw new Error('Store data was not found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Store data successfully fetched',
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
};
