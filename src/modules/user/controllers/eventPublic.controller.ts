import { HTTP_STATUS } from '@/config/constants';
import { EventModel } from '@/modules/events/models/event';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';

export const getAllPublicEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
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
    const dbQuery: Record<string, any> = { isActive: true };

    if (search) {
      const searchTerm = new RegExp(search, 'ig');
      dbQuery.$or = [
        { title: searchTerm },
        { slug: searchTerm },
        { description: searchTerm },
        { location: searchTerm },
      ];
    }

    const sortOptions = {
      latest: { createdAt: -1 },
      earliest: { createdAt: 1 },
      popular: { capacity: -1 },
    } as const;

    const sortQuery = sortOptions[sort as keyof typeof sortOptions] || sortOptions.latest;

    const [events, total] = await Promise.all([
      EventModel.find(dbQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .select('-owner -closeReason -attendees')
        .lean(),
      EventModel.countDocuments(dbQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: {
        message: events.length ? 'لیست رویدادهای فعال' : 'هیچ رویداد فعالی برای نمایش وجود ندارد',
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

export const getEventPublicBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const event = await EventModel.findOne({ slug }).select('-owner -closeReason -attendees');

    if (!event) throw createHttpError.NotFound('رویداد یافت نشد');

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};
