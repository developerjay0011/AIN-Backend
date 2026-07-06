import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as awardsController from '../controllers/awardsController.js';

const router = Router();

// Public routes
router.get('/', awardsController.getAllAwards);
router.get('/types', awardsController.getAllAwardTypes);

// Protected routes (Admin Auth Required)
router.post('/types', authMiddleware, awardsController.createAwardType);
router.put('/types/:id', authMiddleware, awardsController.updateAwardType);
router.delete('/types/:id', authMiddleware, awardsController.deleteAwardType);

router.post('/', authMiddleware, categoryUpload('awards').single('image'), awardsController.createAward);
router.put('/:id', authMiddleware, categoryUpload('awards').single('image'), awardsController.updateAward);
router.delete('/:id', authMiddleware, awardsController.deleteAward);

export default router;
