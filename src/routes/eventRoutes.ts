import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as eventController from '../controllers/eventController.js';

const router = Router();

router.get('/', eventController.getAllEvents);
router.post('/', categoryUpload('events').single('coverImage'), eventController.handleEventPost);
router.delete('/:id', eventController.deleteEvent);

export default router;
