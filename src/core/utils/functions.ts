import nodemailer from 'nodemailer';
import JWT, { JwtPayload, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Response, Request } from 'express';
import { IUser } from '../types';
import createHttpError from 'http-errors';
import cookieParser from 'cookie-parser';
import { UserModel } from '@/modules/user/models/user';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateToken(user: IUser, expiresIn: SignOptions, secret: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: JwtPayload = {
      _id: user._id,
    };

    JWT.sign(
      payload,
      secret || process.env.TOKEN_SECRET_KEY!,
      expiresIn,
      (err: Error | null, token: string | undefined) => {
        if (err) reject(createHttpError.InternalServerError('خطای سروری'));
        if (!token) reject(createHttpError.InternalServerError('خطای سروری'));
        resolve(token as string);
      }
    );
  });
}

export async function setAccessToken(res: Response, user: IUser) {
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 1, // would expire after 1 days
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    sameSite: 'lax' as const, // Fixed sameSite type
    secure: process.env.NODE_ENV === 'development' ? false : true,
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.fronthooks.ir',
  };
  const token = await generateToken(
    user,
    '1d' as SignOptions,
    process.env.ACCESS_TOKEN_SECRET_KEY!
  );
  res.cookie('accessToken', token, cookieOptions);
}

export async function setRefreshToken(res: Response, user: IUser) {
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 365, // would expire after 1 year
    httpOnly: true, // The cookie only accessible by the web server
    signed: true, // Indicates if the cookie should be signed
    sameSite: 'lax' as const, // Fixed sameSite type
    secure: process.env.NODE_ENV === 'development' ? false : true,
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.fronthooks.ir',
  };
  const token = await generateToken(
    user,
    '1y' as SignOptions,
    process.env.REFRESH_TOKEN_SECRET_KEY!
  );
  res.cookie('refreshToken', token, cookieOptions);
}

export function verifyRefreshToken(req: Request) {
  const refreshToken = req.signedCookies['refreshToken'];
  if (!refreshToken) {
    throw createHttpError.Unauthorized('لطفا وارد حساب کاربری خود شوید.');
  }

  const token = cookieParser.signedCookie(refreshToken, process.env.COOKIE_PARSER_SECRET_KEY!);

  if (typeof token !== 'string') {
    throw createHttpError.Unauthorized('توکن نامعتبر است.');
  }

  return new Promise<string>((resolve, reject) => {
    JWT.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY!, async (err, payload) => {
      try {
        if (err) {
          return reject(createHttpError.Unauthorized('لطفا وارد حساب کاربری خود شوید'));
        }

        if (!payload || typeof payload !== 'object' || !('_id' in payload)) {
          return reject(createHttpError.Unauthorized('اطلاعات توکن نامعتبر است'));
        }

        const { _id } = payload as JwtPayload;
        const user = await UserModel.findById(_id, {
          password: 0,
          otp: 0,
          resetLink: 0,
        });

        if (!user) {
          return reject(createHttpError.Unauthorized('حساب کاربری یافت نشد'));
        }

        resolve(_id);
      } catch (error) {
        reject(createHttpError.Unauthorized('خطا در احراز هویت'));
      }
    });
  });
}

export function toPersianDigits(n: string) {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, x => farsiDigits[parseInt(x)]);
}

export function generateRandomNumber(length: number) {
  if (length === 5) {
    return Math.floor(10000 + Math.random() * 90000);
  }
  if (length === 6) {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
