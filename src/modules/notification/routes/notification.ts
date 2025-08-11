import express from 'express';
import { verifyAccessToken } from '@/core/middleware/user.middleware';
import expressAsyncHandler from 'express-async-handler';
import {
  getMyNotifications,
  markAsRead,
  createNotification,
} from '../controllers/notification.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.post('/send', expressAsyncHandler(createNotification as any));
router.get('/', expressAsyncHandler(getMyNotifications as any));
router.patch('/read/:id', expressAsyncHandler(markAsRead as any));

export default router;
