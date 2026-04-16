import { Router } from 'express';
import { upload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAboutContent, updateAboutContent } from '../controllers/aboutController.js';

const router = Router();

// GET /api/about - Public access to about content
router.get('/', getAboutContent);

// PUT /api/about - Restricted access to update about content
router.put('/', 
  authMiddleware, 
  upload.fields([
    { name: 'director_image', maxCount: 1 },
    { name: 'principal_image', maxCount: 1 },
    { name: 'registrar_image', maxCount: 1 }
  ]), 
  updateAboutContent
);

export default router;
