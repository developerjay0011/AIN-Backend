import { Router } from 'express';
import * as toppersController from '../controllers/toppersController.js';
import { upload } from '../config/uploadConfig.js';

const router = Router();

router.get('/', toppersController.getAllToppers);
router.post('/', upload.single('image'), toppersController.handleTopperPost);
router.delete('/:id', toppersController.deleteTopper);

export default router;
