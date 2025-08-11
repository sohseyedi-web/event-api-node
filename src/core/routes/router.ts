import express from 'express';
import userAuthRoutes from '@/modules/user/routes/userAuth';
import eventRoutes from '@/modules/events/routes/event';
import notificationRouter from '@/modules/notification/routes/notification';
import transactionRouter from '@/modules/transaction/routes/transaction';
import adminRouter from '@/modules/admin/routes/admin.routes';

const router = express.Router();

router.use('/user', userAuthRoutes);
router.use('/owner', eventRoutes);
router.use('/notification', notificationRouter);
router.use('/t', transactionRouter);
router.use('/admin', adminRouter);

export default router;
