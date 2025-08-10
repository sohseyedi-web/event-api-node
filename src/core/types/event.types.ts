import { Document, Types } from 'mongoose';

export interface IAttendee {
  user: Types.ObjectId;
  registeredAt?: Date;
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

export interface IEvent extends Document {
  title: string;
  enTitle: string;
  slug: string;
  city: string;
  description: string;
  capacity: number;
  sessions: number;
  eventDate: Date;
  price: number;
  thumbnail: string;
  owner: Types.ObjectId;
  isActive: boolean;
  isOpen: boolean;
  closeReason: string;
  attendees: IAttendee[];
  availableSeats: number;
  createdAt?: Date;
  updatedAt?: Date;
  thumbnailUrl?: string;
}
