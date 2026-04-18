import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as heroController from '../controllers/heroController.js';

const router = Router();

router.get('/', heroController.getAllHeroSlides);
router.delete('/:id', heroController.deleteHeroSlide);
router.post('/', categoryUpload('hero').single('image'), heroController.handleHeroPost);

export default router;
