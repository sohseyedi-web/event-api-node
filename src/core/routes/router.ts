import express from 'express';
import userAuthRoutes from '@/modules/user/routes/userAuth';
import eventRoutes from '@/modules/events/routes/event';
import notificationRouter from '@/modules/notification/routes/notification';

const router = express.Router();

router.use('/user', userAuthRoutes);
router.use('/owner', eventRoutes);
router.use('/notification', notificationRouter);

export default router;
