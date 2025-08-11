import nodemailer from 'nodemailer';
import JWT, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Response, Request } from 'express';
import { IUser } from '../types';
import createHttpError from 'http-errors';
import { UserModel } from '@/modules/user/models/user';
dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateToken(user: IUser, expiresIn: '1d' | '1y', secret: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload: JwtPayload = { _id: user._id };

    JWT.sign(payload, secret, { expiresIn }, (err, token) => {
      if (err || !token) return reject(new Error('خطا'));
      resolve(token);
    });
  });
}

export async function setAccessToken(res: Response, user: IUser) {
  const token = await generateToken(user, '1d', process.env.ACCESS_TOKEN_SECRET_KEY!);

  res.cookie('accessToken', token, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.fronthooks.ir',
  });
}

export async function setRefreshToken(res: Response, user: IUser) {
  const token = await generateToken(user, '1y', process.env.REFRESH_TOKEN_SECRET_KEY!);

  res.cookie('refreshToken', token, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: true,
    signed: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.fronthooks.ir',
  });
}

export async function verifyRefreshToken(req: Request) {
  const refreshToken = req.signedCookies['refreshToken'];
  if (!refreshToken) {
    throw createHttpError.Unauthorized('لطفا وارد حساب کاربری خود شوید.');
  }

  try {
    const payload = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY!) as JwtPayload;

    if (!payload || !payload._id) {
      throw createHttpError.Unauthorized('اطلاعات توکن نامعتبر است');
    }

    const user = await UserModel.findById(payload._id, {
      password: 0,
      otp: 0,
      resetLink: 0,
    });

    if (!user) {
      throw createHttpError.Unauthorized('حساب کاربری یافت نشد');
    }

    return payload._id;
  } catch (err) {
    throw createHttpError.Unauthorized('لطفا وارد حساب کاربری خود شوید');
  }
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

export function copyObject<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

export function deleteInvalidPropertyInObject<T extends Record<string, any>>(
  data: T = {} as T,
  blackListFields: (keyof T)[] = []
): Partial<T> {
  const nullishData: (string | null | undefined)[] = ['', ' ', null, undefined];

  Object.keys(data).forEach(key => {
    const typedKey = key as keyof T;

    if (blackListFields.includes(typedKey)) {
      delete data[typedKey];
      return;
    }

    if (typeof data[typedKey] === 'string') {
      data[typedKey] = (data[typedKey] as string).trim() as T[keyof T];
    }

    if (Array.isArray(data[typedKey]) && data[typedKey].length > 0) {
      data[typedKey] = (data[typedKey] as string[]).map(item => item.trim()) as T[keyof T];
    }

    if (Array.isArray(data[typedKey]) && data[typedKey].length === 0) {
      delete data[typedKey];
      return;
    }

    if (nullishData.includes(data[typedKey] as any)) {
      delete data[typedKey];
    }
  });

  return data;
}
