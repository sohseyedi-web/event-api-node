import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import {
  getAllUsers,
  getUserDetailWithId,
  userProfile,
  verifyUser,
} from '../controllers/user.controller';
const router = express.Router();

router.get('/list', expressAsyncHandler(getAllUsers as any));
router.patch('/verify/:userId', expressAsyncHandler(verifyUser as any));
router.get('/profile/:userId', expressAsyncHandler(userProfile as any));
router.get('/detail/:phone', expressAsyncHandler(getUserDetailWithId as any));

export default router;
