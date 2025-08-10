import { Document } from 'mongoose';
import { IUser } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & Document;
    }
  }
}
