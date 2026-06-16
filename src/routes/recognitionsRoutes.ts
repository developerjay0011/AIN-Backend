import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as recognitionsController from '../controllers/recognitionsController.js';

const router = Router();

// Public routes
router.get('/', recognitionsController.getAllRecognitions);
router.get('/types', recognitionsController.getAllRecognitionTypes);

// Protected routes (Admin Auth Required)
router.post('/types', authMiddleware, recognitionsController.createRecognitionType);
router.put('/types/:id', authMiddleware, recognitionsController.updateRecognitionType);
router.delete('/types/:id', authMiddleware, recognitionsController.deleteRecognitionType);

router.post('/', authMiddleware, categoryUpload('recognitions').single('image'), recognitionsController.createRecognition);
router.put('/:id', authMiddleware, categoryUpload('recognitions').single('image'), recognitionsController.updateRecognition);
router.delete('/:id', authMiddleware, recognitionsController.deleteRecognition);

export default router;
