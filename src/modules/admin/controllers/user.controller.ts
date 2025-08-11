import { HTTP_STATUS } from '@/config/constants';
import { IUser } from '@/core/types';
import { UserModel } from '@/modules/user/models/user';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const getAllUsers = async (req: CustomRequest, res: Response): Promise<void> => {
  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const search = req.query.search as string;
  const searchTerm = search ? new RegExp(search, 'ig') : undefined;

  const query: any = {};
  if (searchTerm) {
    query.$or = [{ name: searchTerm }, { email: searchTerm }, { phoneNumber: searchTerm }];
  }

  const users = await UserModel.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    statusCode: HTTP_STATUS.OK,
    data: { users },
  });
};

export const getUserDetailWithId = async (req: CustomRequest, res: Response): Promise<void> => {
  const { phone } = req.params;
  const user = await UserModel.findOne({ phoneNumber: phone });
  res.status(HTTP_STATUS.OK).json({
    statusCode: HTTP_STATUS.OK,
    data: {
      user,
    },
  });
};

export const userProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  const { userId } = req.params;
  const user = await UserModel.findById(userId, { otp: 0 });

  res.status(HTTP_STATUS.OK).json({
    statusCode: HTTP_STATUS.OK,
    data: {
      user,
    },
  });
};
export const verifyUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { isActive } },
      { new: true }
    );

    if (!user) throw createHttpError.NotFound('کاربر با این مشخصات یافت نشد');

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: `وضعیت کاربر به ${isActive ? 'فعال' : 'غیرفعال'} تغییر یافت`,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};
