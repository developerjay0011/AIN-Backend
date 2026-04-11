import { Router } from 'express';
import * as heroController from '../controllers/heroController.js';
import { upload } from '../config/uploadConfig.js';

const router = Router();

router.get('/', heroController.getAllHeroSlides);
router.post('/', upload.single('image'), heroController.handleHeroPost);
router.delete('/:id', heroController.deleteHeroSlide);

export default router;
