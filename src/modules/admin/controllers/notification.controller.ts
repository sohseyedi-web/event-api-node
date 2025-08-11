import { HTTP_STATUS } from '@/config/constants';
import { IUser } from '@/core/types';
import { NotificationModel } from '@/modules/notification/models/notification';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const getNotificationsForAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: adminId, role } = req.user;
    if (role !== 'ADMIN') throw createHttpError.Forbidden('دسترسی غیرمجاز');

    const notifications = await NotificationModel.find({ receiver: adminId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: 'لیست اعلان‌ها',
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const sendNotificationToUsersByAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: adminId, role } = req.user;
    if (role !== 'ADMIN') throw createHttpError.Forbidden('دسترسی غیرمجاز');

    const { receiverIds, title, message, type = 'admin-message' } = req.body;

    if (!Array.isArray(receiverIds) || receiverIds.length === 0) {
      throw createHttpError.BadRequest('لیست کاربران الزامی است');
    }

    if (!title || !message) {
      throw createHttpError.BadRequest('عنوان و پیام ناتیف الزامی است');
    }

    const notifications = receiverIds.map(id => ({
      receiver: id,
      sender: adminId,
      title,
      message,
      type,
    }));

    await NotificationModel.insertMany(notifications);

    res.status(HTTP_STATUS.CREATED).json({
      statusCode: HTTP_STATUS.CREATED,
      data: {
        message: 'اعلان با موفقیت برای کاربران ارسال شد',
        count: notifications.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
