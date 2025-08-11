import { sendNotification } from '@/core/utils/functions';
import { EventModel } from '@/modules/events/models/event';
import createHttpError from 'http-errors';
import { TransactionModel } from '../models/transaction';
import { NextFunction, Request, Response } from 'express';
import { IEvent, IUser } from '@/core/types';
import { HTTP_STATUS } from '@/config/constants';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const purchaseEvent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: userId, name } = req.user;
    const { paymentMethod, eventId } = req.body;

    const event = await EventModel.findById(eventId);

    if (!event) {
      throw createHttpError.NotFound('رویداد مورد نظر یافت نشد');
    }

    if (event.availableSeats <= 0) {
      throw createHttpError.BadRequest('ظرفیت رویداد تکمیل شده است');
    }

    const transaction = await TransactionModel.create({
      user: userId,
      event: eventId,
      amount: event.price,
      paymentMethod,
      transactionId: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    if (paymentMethod === 'online') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      transaction.status = 'completed';
      await transaction.save();

      event.attendees.push({
        user: userId as Types.ObjectId,
        paymentStatus: 'paid',
      });
      event.availableSeats -= 1;
      await event.save();
    }

    await sendNotification({
      recipient: event.owner,
      title: 'خرید جدید بلیت',
      message: `کاربری برای رویداد "${event.title}" یک بلیت خرید.`,
      type: 'ticket',
      sender: name,
      senderId: userId as Types.ObjectId,
    });

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: 'پرداخت با موفقیت انجام شد',
        transaction: {
          id: transaction._id,
          event: event.title,
          amount: transaction.amount,
          status: transaction.status,
          transactionId: transaction.transactionId,
        },
        event: {
          availableSeats: event.availableSeats,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTransactions = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: userId } = req.user;

    const transactions = await TransactionModel.find({ user: userId })
      .populate('event', 'title thumbnail eventDate')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        transactions: transactions.map(trx => {
          const event = trx.event as IEvent;
          return {
            id: trx._id,
            event: {
              id: event._id,
              title: event.title,
              date: event.eventDate,
              thumbnail: event.thumbnail,
            },
            amount: trx.amount,
            status: trx.status,
            paymentMethod: trx.paymentMethod,
            date: trx.createdAt,
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};
