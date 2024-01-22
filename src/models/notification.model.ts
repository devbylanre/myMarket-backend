import mongoose, { Schema, Types } from 'mongoose';

const SIGN_UP = 'SIGN_UP';
const FOLLOW = 'FOLLOW';
const OTHERS = 'OTHERS';

type NotificationType<
  S extends typeof SIGN_UP | typeof FOLLOW | typeof OTHERS
> = { type: S };

type Other = {
  recipient: Types.ObjectId;
  message: string;
  read?: boolean;
  createdAt?: Date;
};

export type NotificationProps =
  | (NotificationType<'FOLLOW'> & {
      sender: Types.ObjectId;
    } & Other)
  | (NotificationType<'SIGN_UP'> & Other);

const notificationSchema = new Schema<NotificationProps>({
  sender: { type: Schema.Types.ObjectId },
  type: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: Schema.Types.ObjectId, required: true },
  read: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
});

export const Notification = mongoose.model<NotificationProps>(
  'notification',
  notificationSchema
);
