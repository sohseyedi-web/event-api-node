import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import { verifyAccessToken } from '@/core/middleware/user.middleware';
import authorize from '@/core/middleware/permission.guard';
import { uploadFile } from '@/core/utils/multer';
import { ROLES } from '@/config/constants';
import {
  addNewEvent,
  getAllEvents,
  getEventAttendees,
  getEventById,
  getEventBySlug,
  removeEvent,
  toggleActivateEvent,
  updateEvent,
} from '../controllers/event.controller';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/all-events', expressAsyncHandler(getAllEvents as any));
router.get('/event/:id', expressAsyncHandler(getEventById as any));
router.get('/event/:slug', expressAsyncHandler(getEventBySlug as any));

// Protected Owner Routes
router.use(verifyAccessToken, authorize(ROLES.ROLES.OWNER));
router.post('/new', uploadFile.single('thumbnail'), expressAsyncHandler(addNewEvent as any));
router.patch('/event/:id', uploadFile.single('thumbnail'), expressAsyncHandler(updateEvent as any));
router.delete('/event/:id', expressAsyncHandler(removeEvent as any));

router.get('/event/attendees/:id', expressAsyncHandler(getEventAttendees as any));

router.patch('/event/activation/:id', expressAsyncHandler(toggleActivateEvent as any));

export default router;
