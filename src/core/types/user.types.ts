import { Document } from 'mongoose';

export interface IOtp {
  code: string;
  expiresIn: Date | null;
}

export interface IUser extends Document {
  name: string;
  faCity?: string;
  enCity?: string;
  email: string;
  address?: string;
  otp: IOtp;
  isActive: boolean;
  role: 'USER' | 'OWNER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
