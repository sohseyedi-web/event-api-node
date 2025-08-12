import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import {
  getAllEventsForAdmin,
  toggleEventOpenStatusByAdmin,
} from '../controllers/event.controller';

const router = express.Router();

router.get('/', expressAsyncHandler(getAllEventsForAdmin as any));
router.patch('/toggle/:id', expressAsyncHandler(toggleEventOpenStatusByAdmin as any));

export default router;
