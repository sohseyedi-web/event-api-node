import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import { getSupportRequests, updateSupportStatus } from '../controllers/support.controller';

const router = express.Router();

router.get('/requests', expressAsyncHandler(getSupportRequests));
router.patch('/requests/:id', expressAsyncHandler(updateSupportStatus));

export default router;
