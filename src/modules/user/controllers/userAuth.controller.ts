import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { UserModel } from '../models/user';
import { emailStyleOtpVerification } from '@/core/utils/email';
import { setAccessToken, setRefreshToken, verifyRefreshToken } from '@/core/utils/functions';
import {
  ownerProfileSchema,
  updateProfileSchema,
  userProfileSchema,
} from '../validators/userSchema';
import { IUser } from '@/core/types';

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const getOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role } = req.body;

    if (!email) throw createHttpError.BadRequest('ایمیل معتبر وارد کنید');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({ email, role, otp: { code: otp, expiresIn: otpExpiresAt } });
    } else {
      user.otp.code = otp;
      user.otp.expiresIn = otpExpiresAt;
      await user.save();
    }

    await emailStyleOtpVerification(email, user.otp.code);
    await setAccessToken(res, user);
    await setRefreshToken(res, user);

    res.status(200).send({
      statusCode: 200,
      data: {
        message: 'کد به ایمیل ارسال شد',
      },
    });
  } catch (error: any) {
    console.log(error);
    const message = error?.message || 'خطای ناشناخته‌ای رخ داد';
    next(error);
    res.status(error.statusCode || 500).json({
      statusCode: error.statusCode || 500,
      error: true,
      message,
    });
  }
};

export const checkOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || user.otp.code != otp || !user?.otp.expiresIn || user?.otp.expiresIn < new Date()) {
      throw createHttpError.Unauthorized('کد نامعتبر یا منقضی شده است');
    }

    user.otp.code = '';
    user.otp.expiresIn = null;
    await user.save();

    res.status(200).send({
      statusCode: 200,
      data: {
        message: 'ورود موفقیت آمیز بود',
        user,
      },
    });
  } catch (error: any) {
    const message = error?.message;
    next(error);
    res.status(error.statusCode).json({
      statusCode: error.statusCode,
      error: true,
      message,
    });
  }
};

export const completeProfile = async (req: CustomRequest, res: Response) => {
  const { user } = req;

  let updateData = {};

  if (user.role !== 'OWNER') {
    await userProfileSchema.validateAsync(req.body);
    const { name } = req.body;
    updateData = { name, isActive: true };
  } else {
    await ownerProfileSchema.validateAsync(req.body);
    const { name, faCity, enCity, address } = req.body;
    updateData = { name, faCity, enCity, address, isActive: true };
  }

  const updatedUser = await UserModel.findOneAndUpdate(
    { _id: user._id },
    { $set: updateData },
    { new: true }
  );

  await setAccessToken(res, updatedUser as IUser);
  await setRefreshToken(res, updatedUser as IUser);

  res.status(201).send({
    statusCode: 201,
    data: {
      message: 'اطلاعات شما با موفقیت تکمیل شد',
      user: updatedUser,
    },
  });
};
export const updateProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  const { _id: userId } = req?.user;
  await updateProfileSchema.validateAsync(req.body);
  const { name, email, address, faCity, enCity } = req.body;

  const updateResult = await UserModel.updateOne(
    { _id: userId },
    {
      $set: { name, email, address, faCity, enCity },
    }
  );
  if (updateResult.modifiedCount === 0) throw createHttpError.BadRequest('اطلاعات ویرایش نشد');
  res.status(200).json({
    statusCode: 200,
    data: {
      message: 'اطلاعات با موفقیت آپدیت شد',
    },
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const userId = await verifyRefreshToken(req);
  const user = await UserModel.findById(userId);
  await setAccessToken(res, user as IUser);
  await setRefreshToken(res, user as IUser);
  res.status(201).json({
    StatusCode: 201,
    data: {
      user,
    },
  });
};
export const getUserProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  const { _id: userId } = req.user;
  const user = await UserModel.findById(userId, { otp: 0 });

  res.status(200).json({
    statusCode: 200,
    data: {
      user,
    },
  });
};

export const logout = (req: Request, res: Response): void => {
  const cookieOptions = {
    maxAge: 1,
    expires: new Date(0),
    httpOnly: true,
    signed: true,
    sameSite: 'lax' as const,
    secure: true,
    path: '/',
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : '.example.ir',
  };

  res.cookie('accessToken', '', cookieOptions);
  res.cookie('refreshToken', '', cookieOptions);

  res.status(200).json({
    StatusCode: 200,
    roles: null,
    auth: false,
    message: 'خروج موفقیت آمیز بود',
  });
};
