import { UserModel } from '@/modules/user/models/user';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { IUser } from '../types';

interface CustomRequest extends Request {
  user?: IUser & Document;
}

export default function authorize(...allowedRoles: string[]) {
  return async function (req: CustomRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?._id) {
        throw createHttpError.Unauthorized('کاربر احراز هویت نشده است');
      }

      const user: IUser | null = await UserModel.findById(req.user._id);

      if (!user) {
        throw createHttpError.NotFound('کاربر پیدا نشد');
      }

      if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
        return next();
      }

      throw createHttpError.Forbidden('شما به این قسمت دسترسی ندارید');
    } catch (error) {
      next(error);
    }
  };
}
