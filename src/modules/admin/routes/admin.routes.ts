import eventAdminRoutes from './event';
import notifAdminRoutes from './notification';
import userAdminRoutes from './user';

const router = require('express').Router();

router.use('/user', userAdminRoutes);
router.use('/event', eventAdminRoutes);
router.use('/notification', notifAdminRoutes);

export default router;
