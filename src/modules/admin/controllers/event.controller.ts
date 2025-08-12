import { HTTP_STATUS } from '@/config/constants';
import { IUser } from '@/core/types';
import { sendNotification } from '@/core/utils/functions';
import { EventModel } from '@/modules/events/models/event';
import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { Types } from 'mongoose';

interface GetAllEventsQuery {
  search?: string;
  city?: string;
  isActive?: string;
  isOpen?: string;
  owner?: string;
  sort?: 'latest' | 'earliest' | 'popular';
  page?: string;
  limit?: string;
}

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const toggleEventOpenStatusByAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { _id: userId } = req.user;

    const event = await EventModel.findById(id);
    if (!event) throw createError.NotFound('رویداد مورد نظر یافت نشد');

    if (event.isOpen) {
      if (!reason || reason.trim().length === 0) {
        throw createError.BadRequest('دلیل بستن رویداد الزامی است');
      }

      event.isOpen = false;
      event.closeReason = reason;
      await event.save();

      await sendNotification({
        recipient: event.owner,
        title: 'بستن رویداد توسط ادمین',
        message: `رویداد "${event.title}" توسط ادمین بسته شد. دلیل: ${reason}`,
        type: 'event',
        senderId: userId as Types.ObjectId,
        sender: 'ایونتیکت',
      });

      res.status(HTTP_STATUS.OK).json({
        statusCode: HTTP_STATUS.OK,
        data: {
          message: 'رویداد با موفقیت بسته شد',
          id: event._id,
          reason,
        },
      });
      return;
    }

    event.isOpen = true;
    event.closeReason = reason;

    await event.save();

    await sendNotification({
      recipient: event.owner,
      title: 'فعال‌سازی مجدد رویداد',
      message: `رویداد "${event.title}" دوباره فعال شد.`,
      type: 'event',
      senderId: userId as Types.ObjectId,
      sender: 'ایونتیکت',
    });

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: 'رویداد با موفقیت فعال شد',
        id: event._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEventsForAdmin = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let {
      search,
      city,
      isActive,
      isOpen,
      owner,
      sort = 'latest',
      page = '1',
      limit = '10',
    }: GetAllEventsQuery = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const filters: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filters.$or = [{ title: regex }, { slug: regex }, { description: regex }];
    }

    if (city) filters.city = city;
    if (typeof isActive !== 'undefined') filters.isActive = isActive === 'true';
    if (typeof isOpen !== 'undefined') filters.isOpen = isOpen === 'true';
    if (owner) filters.owner = owner;

    const sortOptions: Record<string, Record<string, 1 | -1>> = {
      latest: { createdAt: -1 },
      earliest: { createdAt: 1 },
      popular: { capacity: -1 },
    };

    const sortQuery = sortOptions[sort] || sortOptions.latest;

    const [events, total] = await Promise.all([
      EventModel.find(filters)
        .populate('owner', 'name phoneNumber')
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      EventModel.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: 'لیست رویدادها',
        events,
        pagination: {
          total,
          page: Number(page),
          pages: totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
