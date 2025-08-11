import express from 'express';
import userAuthRoutes from '@/modules/user/routes/userAuth';
import eventRoutes from '@/modules/events/routes/event';

const router = express.Router();

router.use('/user', userAuthRoutes);
router.use('/owner', eventRoutes);

export default router;
