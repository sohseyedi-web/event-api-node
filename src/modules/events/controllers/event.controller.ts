import createHttpError from 'http-errors';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import { EventModel } from '../models/event';
import { copyObject, deleteInvalidPropertyInObject } from '@/core/utils/functions';
import { eventQuerySchema, addNewEventSchema, updateEventSchema } from '../validators/eventSchema';
import { IEvent, IAttendee, IUser } from '@/core/types';
import { HTTP_STATUS } from '@/config/constants';

interface CustomRequest extends Request {
  user: IUser & Document;
}

// Helper
async function findEventById(id: string): Promise<IEvent> {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError.BadRequest('شناسه رویداد نامعتبر است');
  }
  const event = await EventModel.findById(id);
  if (!event) {
    throw createHttpError.NotFound('رویداد یافت نشد');
  }
  return event;
}

// Controllers
export const getAllEvents = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: ownerId } = req.user as { _id: Types.ObjectId };
    await eventQuerySchema.validate(req.body);

    let {
      search,
      sort,
      page = 1,
      limit = 6,
    } = req.query as {
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    };

    const skip = (page - 1) * limit;
    const dbQuery: Record<string, any> = { owner: ownerId };

    if (search) {
      const searchTerm = new RegExp(search, 'ig');
      dbQuery.$or = [{ title: searchTerm }, { slug: searchTerm }, { description: searchTerm }];
    }

    const sortOptions = {
      latest: { createdAt: -1 },
      earliest: { createdAt: 1 },
      popular: { capacity: -1 },
    } as const;

    const sortQuery = sortOptions[sort as keyof typeof sortOptions] || sortOptions.latest;

    const [events, total] = await Promise.all([
      EventModel.find(dbQuery).sort(sortQuery).skip(skip).limit(limit).lean(),
      EventModel.countDocuments(dbQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: events.length ? 'رویدادهای شما' : 'هیچ رویدادی برای نمایش وجود ندارد',
        events,
        pagination: {
          total,
          page,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBySlug = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const event = await EventModel.findOne({ slug });

    if (!event) throw createHttpError.NotFound('رویداد یافت نشد');

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { _id: ownerId } = req.user as { _id: Types.ObjectId };

    const event = await EventModel.findOne({ _id: id, owner: ownerId }).lean();
    if (!event) throw createHttpError.NotFound('رویداد یافت نشد');

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

export const addNewEvent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { _id: ownerId } = req.user as { _id: Types.ObjectId };
    const { filename, fileUploadPath, ...rest } = req.body;
    await addNewEventSchema.validate(rest);

    if (!fileUploadPath || !filename) {
      throw createHttpError.BadRequest('تصویر کاور رویداد الزامی است');
    }

    const fileAddress = path.join(fileUploadPath, filename).replace(/\\/g, '/');

    const event = await EventModel.create({
      ...rest,
      thumbnail: fileAddress,
      owner: ownerId,
    });

    res.status(HTTP_STATUS.CREATED).json({
      statusCode: HTTP_STATUS.CREATED,
      data: { message: 'رویداد با موفقیت ایجاد شد', event },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { _id: ownerId } = req.user as { _id: Types.ObjectId };
    const { filename, fileUploadPath, ...rest } = req.body;
    await updateEventSchema.validate(rest);

    const event = await findEventById(id);

    if (event.owner.toString() !== ownerId.toString()) {
      throw createHttpError.Forbidden('شما مجوز ویرایش این رویداد را ندارید');
    }

    const data = copyObject(rest);
    deleteInvalidPropertyInObject(data);

    if (fileUploadPath && filename) {
      data.thumbnail = path.join(fileUploadPath, filename).replace(/\\/g, '/');
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(id, { $set: data }, { new: true });

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: { message: 'رویداد با موفقیت به‌روزرسانی شد', event: updatedEvent },
    });
  } catch (error) {
    next(error);
  }
};

export const removeEvent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { _id: ownerId } = req.user as { _id: Types.ObjectId };

    const event = await findEventById(id);

    if (event.owner.toString() !== ownerId.toString()) {
      throw createHttpError.Forbidden('شما مجوز حذف این رویداد را ندارید');
    }

    await EventModel.findByIdAndDelete(id);

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: { message: 'رویداد با موفقیت حذف شد' },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventAttendees = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: eventId } = req.params;
    const { _id: userId } = req.user as { _id: Types.ObjectId };

    const event = await EventModel.findOne({ _id: eventId, owner: userId })
      .populate<{
        attendees: (IAttendee & {
          user: { _id: Types.ObjectId; name: string; email: string; phoneNumber: string };
        })[];
      }>('attendees.user', 'name phoneNumber email')
      .select('title attendees availableSeats');

    if (!event) {
      throw createHttpError.Forbidden('شما مجوز مشاهده این اطلاعات را ندارید');
    }

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      message: 'لیست افراد ثبت نام شده ',
      data: {
        id: event._id,
        title: event.title,
        totalAttendees: event.attendees.length,
        availableSeats: event.availableSeats,
        attendees: event.attendees.map(attendee => ({
          userId: attendee.user._id,
          name: attendee.user.name,
          email: attendee.user.email,
          phone: attendee.user.phoneNumber,
          registeredAt: attendee.registeredAt,
          paymentStatus: attendee.paymentStatus,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleActivateEvent = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { _id: ownerId } = req.user as { _id: Types.ObjectId };
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw createHttpError.BadRequest('وضعیت isActive باید boolean باشد');
    }

    const event = await EventModel.findOne({ _id: id, owner: ownerId });
    if (!event) throw createHttpError.NotFound('رویداد یافت نشد یا به شما تعلق ندارد');

    event.isActive = isActive;
    await event.save();

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: { message: `رویداد با موفقیت ${isActive ? 'فعال' : 'غیرفعال'} شد`, eventId: event._id },
    });
  } catch (error) {
    next(error);
  }
};
