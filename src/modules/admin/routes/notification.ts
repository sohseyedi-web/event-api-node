import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import {
  getNotificationsForAdmin,
  sendNotificationToUsersByAdmin,
} from '../controllers/notification.controller';
const router = express.Router();

router.get('/', expressAsyncHandler(getNotificationsForAdmin as any));
router.post('/send-to-users', expressAsyncHandler(sendNotificationToUsersByAdmin as any));

export default router;
