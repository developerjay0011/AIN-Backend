import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAlumniHistory, syncAlumniHistory } from '../controllers/alumniController.js';

const router = Router();

// GET /api/alumni/history - Public access
router.get('/history', getAlumniHistory);

// PUT /api/alumni/history - Restricted access to sync history
router.put('/history',
  authMiddleware,
  categoryUpload('alumni').any(), // Use any() to allow dynamic field names like milestone_image_0
  syncAlumniHistory
);

export default router;
