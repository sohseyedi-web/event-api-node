import { Types } from 'mongoose';

export interface IMessage {
  sender: Types.ObjectId;
  message: string;
  sentAt?: Date;
}

export interface ITicket extends Document {
  owner: Types.ObjectId;
  support?: Types.ObjectId;
  subject: string;
  status: 'open' | 'pending' | 'closed';
  messages: IMessage[];
}
