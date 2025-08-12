import { HTTP_STATUS } from '@/config/constants';
import { IUser } from '@/core/types';
import { sendNotification } from '@/core/utils/functions';
import { UserModel } from '@/modules/user/models/user';
import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

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

export const getUserDetailWithEmail = async (req: CustomRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
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
    const { _id: adminId } = req.user;

    const user = await UserModel.findById(userId);

    if (!user) {
      throw createHttpError.NotFound('کاربر با این مشخصات یافت نشد');
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { isActive: !user.isActive } },
      { new: true }
    );

    const statusMessage = `حساب کاربری شما در حالت ${
      updatedUser?.isActive ? 'فعال' : 'غیرفعال'
    } قرار گرفت. ${
      !updatedUser?.isActive
        ? 'در صورت نیاز می‌توانید از طریق پشتیبانی دلیل این تغییر را جویا شوید.'
        : ''
    }`;

    await sendNotification({
      title: 'تغییر وضعیت حساب کاربری',
      message: statusMessage,
      type: 'system',
      sender: 'ایونتیکت',
      senderId: adminId as Types.ObjectId,
      recipient: updatedUser?._id as Types.ObjectId,
    });

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: `وضعیت کاربر به ${updatedUser?.isActive ? 'فعال' : 'غیرفعال'} تغییر یافت`,
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
