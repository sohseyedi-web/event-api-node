import { verifyAccessToken } from '@/core/middleware/user.middleware';
import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import { getUserTransactions, purchaseEvent } from '../controllers/transaction.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/all-payments', expressAsyncHandler(getUserTransactions as any));
router.post('/purchase', expressAsyncHandler(purchaseEvent as any));

export default router;
