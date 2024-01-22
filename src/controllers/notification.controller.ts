import { Request, Response } from 'express';
import { Notification, NotificationProps } from '../models/notification.model';
import { useResponse } from '../lib/useResponse';

const createNotification = async (data: NotificationProps) => {
  const doc = Notification.create(data);
  return await doc;
};

const readNotification = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updateDoc = async () => {
    const doc = await Notification.findByIdAndUpdate(id, { read: true });
    return doc;
  };

  const getDoc = async () => {
    const doc = await Notification.findById(id);
    return doc;
  };
};

const getNotification = (req: Request, res: Response) => {
  const { id } = req.params;

  const getDoc = async (req: Request, res: Response) => {
    const doc = await Notification.findById(id);
  };
};

const getNotifications = async (req: Request, res: Response) => {
  const filter = req.params;

  const docs = await Notification.find(filter);
};

export { createNotification };
