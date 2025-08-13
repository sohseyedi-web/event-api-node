import { IMessage, ITicket } from '@/core/types';
import { Schema, model } from 'mongoose';

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    support: { type: Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'pending', 'closed'],
      default: 'open',
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export const TicketModel = model<ITicket>('Ticket', TicketSchema);
