import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@/config/constants';
import { TicketModel } from '../models/ticket';
import { IUser } from '@/core/types';
import { Types } from 'mongoose';

interface CustomRequest extends Request {
  user: IUser & Document;
}

export const createTicket = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'موضوع و پیام الزامی است' });
    }

    const ticket = await TicketModel.create({
      owner: req.user._id,
      subject,
      status: 'pending',
      messages: [{ sender: req.user._id, message }],
    });

    res.status(HTTP_STATUS.CREATED).json({
      statusCode: HTTP_STATUS.CREATED,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let query = {};
    if (req.user.role === 'SUPPORT') {
      query = {};
    } else {
      query = { owner: req.user._id };
    }

    const tickets = await TicketModel.find(query).sort({ createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const { _id: userId, role } = req.user;

    if (!Types.ObjectId.isValid(ticketId)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'شناسه تیکت معتبر نیست' });
    }

    if (!message) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'متن پیام الزامی است' });
    }

    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'تیکت یافت نشد' });
    }

    if (ticket?.status === 'closed') {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: 'تیکت بسته شده و نمی‌توان پیام ارسال کرد' });
    }

    if (ticket?.status === 'pending' && role !== 'SUPPORT') {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: 'تا زمان تایید پشتیبان نمی‌توانید پیام ارسال کنید' });
    }

    if (role === 'SUPPORT' && !ticket?.support && ticket) {
      ticket.support = userId as Types.ObjectId;
    }

    ticket?.messages.push({ sender: userId as Types.ObjectId, message });
    await ticket?.save();

    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const { _id: userId, role } = req?.user;

    if (!Types.ObjectId.isValid(ticketId)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'شناسه تیکت معتبر نیست' });
    }

    if (!['open', 'pending', 'closed'].includes(status)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: 'وضعیت تیکت نامعتبر است' });
    }

    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'تیکت یافت نشد' });
    }

    if ((role === 'USER' || role === 'OWNER') && ticket?.owner.toString() !== userId) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'اجازه تغییر وضعیت این تیکت را ندارید' });
    }
    res.status(HTTP_STATUS.OK).json({
      statusCode: HTTP_STATUS.OK,
      message: `وضعیت تیکت به ${status} تغییر یافت`,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
