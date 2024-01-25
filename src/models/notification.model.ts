import mongoose, { Schema, Types } from 'mongoose';

const SIGN_UP = 'SIGN_UP';
const FOLLOW = 'FOLLOW';
const OTHERS = 'OTHERS';

type NotificationType<
  S extends typeof SIGN_UP | typeof FOLLOW | typeof OTHERS
> = { type: S };

type Other = {
  reference: Types.ObjectId;
  message: string;
  read?: boolean;
  createdAt?: Date;
};

export type NotificationDoc =
  | (Document &
      (NotificationType<'FOLLOW'> & {
        sender: Types.ObjectId;
      } & Other))
  | (Document & NotificationType<'SIGN_UP'> & Other);

const notificationSchema = new Schema<NotificationDoc>({
  type: { type: String, required: true },
  message: { type: String, required: true },
  reference: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  sender: { type: Schema.Types.ObjectId, ref: 'Users' },
  read: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
});

export const Notification = mongoose.model<NotificationDoc>(
  'Notifications',
  notificationSchema
);
