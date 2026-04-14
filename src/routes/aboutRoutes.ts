import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAboutContent, updateAboutContent } from '../controllers/aboutController.js';

const router = Router();

// GET /api/about - Public access to about content
router.get('/', getAboutContent);

// PUT /api/about - Restricted access to update about content
router.put('/', authMiddleware, updateAboutContent);

export default router;
