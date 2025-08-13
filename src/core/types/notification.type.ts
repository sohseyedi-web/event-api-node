import { Types } from 'mongoose';

export interface INotification {
  title: string;
  message: string;
  recipient?: Types.ObjectId;
  sender: string;
  senderId: Types.ObjectId | string;
  isRead?: boolean;
  type: 'admin' | 'event' | 'system' | 'ticket';
  createdAt?: Date;
  updatedAt?: Date;
}
