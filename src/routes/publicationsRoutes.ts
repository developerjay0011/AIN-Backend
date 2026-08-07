import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getPublications,
  createPublication,
  updatePublication,
  deletePublication
} from '../controllers/publicationsController.js';

const router = Router();

// GET all publications (public)
router.get('/', getPublications);

// Restricted CRUD
router.post('/', authMiddleware, categoryUpload('publications').any(), createPublication);
router.put('/:id', authMiddleware, categoryUpload('publications').any(), updatePublication);
router.delete('/:id', authMiddleware, deletePublication);

export default router;
