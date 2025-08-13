import { HTTP_STATUS } from '@/config/constants';
import { emailStyleJobRequest } from '@/core/utils/email';
import { sendNotification } from '@/core/utils/functions';
import { SupportModel } from '@/modules/support/models/support';
import { supportRequestValidator } from '@/modules/support/validators/supportSchema';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const createSupportRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;
    await supportRequestValidator.validateAsync(req.body);
    const request = await SupportModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
    });

    emailStyleJobRequest(email, firstName);
    await sendNotification({
      type: 'admin',
      title: 'درخواست شغلی',
      message: `یک درخواست شغلی جدید ثبت شده است`,
      sender: `${firstName} ${lastName}`,
      senderId: request._id as Types.ObjectId,
    });

    res.status(HTTP_STATUS.CREATED).json({
      statusCode: HTTP_STATUS.CREATED,
      message: 'درخواست شما ثبت شد و ایمیل تایید ارسال گردید',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
