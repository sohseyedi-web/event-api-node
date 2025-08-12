import expressAsyncHandler from 'express-async-handler';
import express from 'express';
import { getAllPublicEvents, getEventPublicBySlug } from '../controllers/eventPublic.controller';

const router = express.Router();

// Public Routes
router.get('/events', expressAsyncHandler(getAllPublicEvents));
router.get('/event/:slug', expressAsyncHandler(getEventPublicBySlug));

export default router;
