import { INotification } from '@/core/types';
import { model, Schema } from 'mongoose';
const { ObjectId } = Schema.Types;

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { type: ObjectId, ref: 'User', required: true },
    senderId: { type: ObjectId, required: true },
    sender: { type: String, ref: 'User', required: true },
    isRead: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['admin', 'event', 'system', 'ticket'],
      default: 'system',
    },
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
