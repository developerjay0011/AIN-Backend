import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAboutContent, updateAboutContent } from '../controllers/aboutController.js';
import { categoryUpload } from '../config/uploadConfig.js';

const router = Router();

// GET /api/about - Public access to about content
router.get('/', getAboutContent);

// PUT /api/about - Restricted access to update about content
router.put('/', authMiddleware, categoryUpload('about').any(), updateAboutContent);

export default router;
