import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as toppersController from '../controllers/toppersController.js';

const router = Router();

router.get('/', toppersController.getAllToppers);
router.delete('/:id', toppersController.deleteTopper);
router.post('/', categoryUpload('toppers').single('image'), toppersController.handleTopperPost);

export default router;
