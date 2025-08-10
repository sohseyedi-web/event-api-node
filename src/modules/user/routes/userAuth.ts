import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import {
  checkOtp,
  completeProfile,
  getOtp,
  getUserProfile,
  logout,
  refreshToken,
  updateProfile,
} from '../controllers/userAuth.controller';
import { verifyAccessToken } from '@/core/middleware/user.middleware';

const router = express.Router();

// Public Routes
router.post('/get-otp', expressAsyncHandler(getOtp));
router.post('/check-otp', expressAsyncHandler(checkOtp));

// protected Routes
router.use(verifyAccessToken);
router.post('/complete', expressAsyncHandler(completeProfile as any));
router.get('/refresh-token', expressAsyncHandler(refreshToken));
router.patch('/update', expressAsyncHandler(updateProfile as any));
router.get('/profile', expressAsyncHandler(getUserProfile as any));
router.post('/logout', expressAsyncHandler(logout));

export default router;
