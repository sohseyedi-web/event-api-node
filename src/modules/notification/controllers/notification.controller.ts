import { HTTP_STATUS } from '@/config/constants';
import { NotificationModel } from '../models/notification';
import { IUser } from '@/core/types';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import { sendNotification } from '@/core/utils/functions';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const createNotification = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, message, recipient, type } = req.body;
    const { _id: userId, name } = req?.user;

    const notification = await sendNotification({
      title,
      message,
      recipient,
      sender: name,
      senderId: userId as Types.ObjectId,
      type,
    });

    res.status(HTTP_STATUS.CREATED).json({
      statusCode: HTTP_STATUS.CREATED,
      message: 'اعلان با موفقیت ارسال شد',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyNotifications = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: userId } = req.user;

    const notifications = await NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await NotificationModel.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) throw createHttpError.NotFound('اعلان یافت نشد');

    notification.isRead = true;
    await notification.save();

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      message: 'اعلان خوانده شد',
    });
  } catch (err) {
    next(err);
  }
};
