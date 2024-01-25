import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { useResponse } from '../lib/useResponse';

export const controller = {
  create: async ({ body }: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      // Create a notification
      const doc = await Notification.create(body);
      if (!doc) throw new Error('Notification alert failed');

      return response({
        type: 'SUCCESS',
        code: 201,
        message: 'Notification created successfully',
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

  read: async (req: Request, res: Response) => {
    const { response } = useResponse(res);

    try {
      const { id } = req.params;

      // Find and update the notification
      const doc = await Notification.findByIdAndUpdate(id, { read: true });
      if (!doc) throw new Error('Could not find notification');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: 'Notification read',
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

      const docs = await Notification.find({ reference });
      if (!docs || docs.length === 0) throw new Error('No notification found');

      return response({
        type: 'SUCCESS',
        code: 200,
        message: `Found ${docs.length} notifications`,
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
