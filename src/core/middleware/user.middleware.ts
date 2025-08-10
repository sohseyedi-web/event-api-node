import { UserModel } from '@/modules/user/models/user';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import JWT, { JwtPayload } from 'jsonwebtoken';
import { IUser } from '../types';

interface CustomRequest extends Request {
  user?: IUser & Document;
}

export async function verifyAccessToken(req: CustomRequest, res: Response, next: NextFunction) {
  try {
    const accessToken = req.signedCookies['accessToken'];
    if (!accessToken) {
      throw createHttpError.Unauthorized('لطفا وارد حساب کاربری خود شوید.');
    }
    const token = cookieParser.signedCookie(accessToken, process.env.COOKIE_PARSER_SECRET_KEY!);

    if (typeof token !== 'string') {
      throw createHttpError.Unauthorized('توکن نامعتبر است.');
    }
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY!, async (err, payload) => {
      try {
        if (err) throw createHttpError.Unauthorized('توکن نامعتبر است');
        const { _id } = payload as JwtPayload;
        const user = await UserModel.findById(_id, {
          otp: 0,
        });
        if (!user) throw createHttpError.Unauthorized('حساب کاربری یافت نشد');
        req.user = user as any;
        return next();
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
}

export function decideAuthMiddleware(req: CustomRequest, res: Response, next: NextFunction) {
  const accessToken = req.signedCookies['accessToken'];
  if (accessToken) {
    return verifyAccessToken(req, res, next);
  }
  // skip this middleware
  next();
}

export function validateOwnerFields(req: CustomRequest, res: Response, next: NextFunction) {
  const { role, email, city, address } = req.body;

  if (role === 'OWNER') {
    if (!email || !city || !address) {
      return res.status(400).json({
        message: 'وارد کردن ایمیل، شهر و آدرس الزامی است.',
      });
    }
  }

  next();
}
