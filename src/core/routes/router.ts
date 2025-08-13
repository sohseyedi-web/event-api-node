import express from 'express';
import userAuthRoutes from '@/modules/user/routes/userAuth';
import publicRoutes from '@/modules/user/routes/public';
import eventRoutes from '@/modules/events/routes/event';
import notificationRouter from '@/modules/notification/routes/notification';
import transactionRouter from '@/modules/transaction/routes/transaction';
import adminRouter from '@/modules/admin/routes/admin.routes';
import ticketRouter from '@/modules/tickets/routes/ticket.routes';

const router = express.Router();

router.use('/user', userAuthRoutes);
router.use('/p', publicRoutes); // public events
router.use('/owner', eventRoutes);
router.use('/notification', notificationRouter);
router.use('/ticket', ticketRouter);
router.use('/t', transactionRouter); // tranactions
router.use('/admin', adminRouter);

export default router;
