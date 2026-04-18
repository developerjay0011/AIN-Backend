import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as galleryController from '../controllers/galleryController.js';

const router = Router();

router.get('/', galleryController.getAllEvents);
router.post('/', categoryUpload('gallery').array('media', 10), galleryController.handleGalleryPost);
router.delete('/:id', galleryController.deleteEvent);

export default router;
