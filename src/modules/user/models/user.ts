import { IUser } from '@/core/types';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    faCity: { type: String },
    enCity: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: { type: String },
    otp: {
      code: { type: String, default: 0 },
      expiresIn: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: false },
    role: { type: String, enum: ['USER', 'OWNER', 'ADMIN'], default: 'USER' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

export const UserModel = model<IUser>('User', UserSchema);
