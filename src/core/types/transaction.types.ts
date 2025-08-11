import { Document, Types } from 'mongoose';
import { IEvent } from './event.types';

export interface ITransaction extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId | IEvent;
  amount: number;
  paymentMethod: 'online' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
