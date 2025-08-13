import { HTTP_STATUS } from '@/config/constants';
import { SupportModel } from '@/modules/support/models/support';
import { UserModel } from '@/modules/user/models/user';
import { NextFunction, Request, Response } from 'express';

export const getSupportRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await SupportModel.find().sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupportStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved | rejected

    const request = await SupportModel.findByIdAndUpdate(id, { status }, { new: true });

    if (!request) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'درخواست پیدا نشد' });
    }

    if (status === 'approved') {
      const fullName = `${request?.firstName} ${request?.lastName}`;

      await UserModel.findOneAndUpdate(
        { email: request?.email },
        {
          name: fullName,
          email: request?.email,
          phoneNumber: request?.phoneNumber,
          role: 'SUPPORT',
          isActive: false,
        },
        { upsert: true, new: true }
      );
    }

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      message: `وضعیت درخواست به ${status === 'approved' ? 'قبول شده' : 'رد شده'} تغییر یافت`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
