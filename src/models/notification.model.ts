import mongoose, { Schema, Types } from 'mongoose';

export interface NotificationTypes {
  userId: Types.ObjectId;
  message: string;
  activityType: string;
  relatedUserId?: Types.ObjectId;
  timestamp?: Date;
  read?: boolean;
}

const notificationSchema = new Schema<NotificationTypes>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    default: '',
    ref: 'user',
  },
  relatedUserId: { type: Schema.Types.ObjectId, ref: 'user' },
  message: { type: String, required: true },
  activityType: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now() },
  read: { type: Boolean, required: true, default: false },
});

export const Notification = mongoose.model<NotificationTypes>(
  'notification',
  notificationSchema
);
