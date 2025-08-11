import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import {
  getAllEventsForAdmin,
  toggleEventOpenStatusByAdmin,
} from '../controllers/event.controller';

const router = express.Router();

router.get('/events', expressAsyncHandler(getAllEventsForAdmin as any));
router.patch('/events/toggle/:id', expressAsyncHandler(toggleEventOpenStatusByAdmin as any));

export default router;
