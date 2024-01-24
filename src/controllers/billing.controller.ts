import { Request, Response } from 'express';
import { useResponse } from '../lib/useResponse';
import { Billing } from '../models/billing.model';
import { useMailer } from '../lib/useMailer';

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);
    const { mail } = useMailer();

    try {
      const { country, state, city, address, user } = body;

      // send an email to the user about his billing information

      const doc = await Billing.findByIdAndUpdate(
        user.id,
        { country, state, city, address, reference: user.id },
        { $upsert: true }
      );

      if (!doc) throw new Error('Unable to create billing');

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Billing created successfully',
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

      const doc = await Billing.findOne({ reference: reference });
      if (!doc) throw new Error('Billing document not found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Billing document fetched successfully',
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
      const { reference } = params;

      const deleteDoc = await Billing.findByIdAndDelete(reference);
      if (!deleteDoc) throw new Error('Billing data could not be found');

      return response({
        type: 'SUCCESS',
        code: 20,
        message: 'Billing deleted successfully',
        data: deleteDoc,
      });
    } catch (error) {}
  },
};
