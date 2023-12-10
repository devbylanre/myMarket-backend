import { Request, Response } from 'express';
import { Notification, NotificationTypes } from '../models/notification.model';

export class NotificationController {
  async createNotification(data: NotificationTypes) {
    try {
      const notification = new Notification(data);

      notification.save();
    } catch (err) {
      console.log('Error creating notification document', err);
    }
  }

  async readNotification(req: Request, res: Response) {
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
  }

  async fetchNotification(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const notifications = await Notification.find({ user: userId });

      return notifications;
    } catch (err) {
      res.status(500).json({ error: err });
    }
  }
}
