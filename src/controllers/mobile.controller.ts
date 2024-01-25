import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Mobile, MobileDoc } from '../models/mobile.model';
import { UpdateWriteOpResult } from 'mongoose';

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId, ...payload } = body;

      const existingDoc = await Mobile.findOne({ reference: userId });

      let doc = '' as unknown;

      if (existingDoc) {
        doc = await Mobile.updateOne({ reference: userId }, payload, {
          new: true,
        });
      }

      doc = await Mobile.create(payload);

      if (!doc) throw new Error('Unable to create document');

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Document created successfully',
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

  get: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = body;

      const doc = await Mobile.findOne({ reference: userId });
      if (!doc) throw new Error('No mobile number found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Mobile number found',
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

  delete: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { userId } = body;

      const doc = await Mobile.findOneAndDelete({ reference: userId });
      if (!doc) throw new Error('Unable to delete mobile number');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Mobile number successfully deleted',
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
