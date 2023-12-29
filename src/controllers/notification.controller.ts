import { Request, Response } from 'express';
import { Notification, NotificationTypes } from '../models/notification.model';

export const notification = {
  create: async function (data: NotificationTypes) {
    try {
      const notification = new Notification(data);

      notification.save();
    } catch (err) {
      console.log('Error creating notification document', err);
    }
  },

  read: async function (req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );

      return res.status(200).json({ state: 'success', data: result });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },

  fetch: async function (req: Request, res: Response) {
    try {
      const { recipient } = req.params;

      const notifications = await Notification.find({ recipient: recipient });

      return notifications;
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },
};
