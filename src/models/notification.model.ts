import mongoose, { Schema, Types } from 'mongoose';

export interface NotificationTypes {
  recipient: Types.ObjectId;
  content: string;
  type: 'sign-up' | 'pinned' | 'follow';
  sender?: Types.ObjectId;
  createdAt?: Date;
  read?: boolean;
}

const notificationSchema = new Schema<NotificationTypes>({
  recipient: {
    type: Schema.Types.ObjectId,
    required: true,
    default: '',
    ref: 'user',
  },
  content: { type: String, required: true },
  type: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now() },
  read: { type: Boolean, required: true, default: false },
});

export const Notification = mongoose.model<NotificationTypes>(
  'notification',
  notificationSchema
);
