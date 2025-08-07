import express from 'express';
import userAuthRoutes from '@/modules/user/routes/userAuth';

const router = express.Router();

router.use('/user', userAuthRoutes);

export default router;
