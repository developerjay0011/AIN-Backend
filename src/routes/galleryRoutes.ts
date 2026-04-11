import { Router } from 'express';
import * as galleryController from '../controllers/galleryController.js';
import { upload } from '../config/uploadConfig.js';

const router = Router();

router.get('/', galleryController.getAllEvents);
router.post('/', upload.array('media', 10), galleryController.handleGalleryPost);
router.delete('/:id', galleryController.deleteEvent);

export default router;
