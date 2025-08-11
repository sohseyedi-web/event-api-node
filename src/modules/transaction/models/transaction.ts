import { ITransaction } from '@/core/types';
import { model, Schema } from 'mongoose';
const { ObjectId } = Schema.Types;

const TransactionSchema = new Schema<ITransaction>(
  {
    user: { type: ObjectId, ref: 'User', required: true },
    event: { type: ObjectId, ref: 'Event', required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['online', 'wallet'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, unique: true },
    paymentDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema);
