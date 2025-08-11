import express from 'express';
import userAuthRoutes from '@/modules/user/routes/userAuth';
import eventRoutes from '@/modules/events/routes/event';
import notificationRouter from '@/modules/notification/routes/notification';
import transactionRouter from '@/modules/transaction/routes/transaction';

const router = express.Router();

router.use('/user', userAuthRoutes);
router.use('/owner', eventRoutes);
router.use('/notification', notificationRouter);
router.use('/t', transactionRouter);

export default router;
