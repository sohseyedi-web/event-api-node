import { Router } from 'express';
import {
  createTicket,
  getMyTickets,
  sendMessage,
  updateTicketStatus,
} from '../controllers/ticket.controller';
import { verifyAccessToken } from '@/core/middleware/user.middleware';
import expressAsyncHandler from 'express-async-handler';

const router = Router();

router.use(verifyAccessToken);
router.post('/', expressAsyncHandler(createTicket as any));
router.get('/my', expressAsyncHandler(getMyTickets as any));
router.post('/messages/:ticketId', expressAsyncHandler(sendMessage as any));
router.patch('/status/:ticketId', expressAsyncHandler(updateTicketStatus as any));

export default router;
