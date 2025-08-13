import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import { getAllPublicEvents, getEventPublicBySlug } from '../controllers/eventPublic.controller';
import { createSupportRequest } from '../controllers/supportPublic.controller';

const router = express.Router();

// Public Routes
router.get('/events', expressAsyncHandler(getAllPublicEvents));
router.get('/event/:slug', expressAsyncHandler(getEventPublicBySlug));
router.post('/create-job', expressAsyncHandler(createSupportRequest));

export default router;
