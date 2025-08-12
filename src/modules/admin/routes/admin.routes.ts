import { verifyAccessToken } from '@/core/middleware/user.middleware';
import eventAdminRoutes from './event';
import notifAdminRoutes from './notification';
import userAdminRoutes from './user';
import { Router } from 'express';
import authorize from '@/core/middleware/permission.guard';
import { ROLES } from '@/config/constants';

const router = Router();

router.use(verifyAccessToken, authorize(ROLES.ROLES.ADMIN));
router.use('/user', userAdminRoutes);
router.use('/event', eventAdminRoutes);
router.use('/notification', notifAdminRoutes);

export default router;
