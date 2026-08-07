import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getCalendarData, updateCalendarData } from '../controllers/calendarController.js';

const router = Router();

router.get('/', getCalendarData);
router.post('/update', authMiddleware, updateCalendarData);

export default router;
