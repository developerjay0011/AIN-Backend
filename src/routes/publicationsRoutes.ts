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

// Restricted CRUD (Supports up to 200MB uploads for publication documents)
const PUBLICATION_MAX_FILE_SIZE = 200 * 1024 * 1024;
router.post('/', authMiddleware, categoryUpload('publications', PUBLICATION_MAX_FILE_SIZE).any(), createPublication);
router.put('/:id', authMiddleware, categoryUpload('publications', PUBLICATION_MAX_FILE_SIZE).any(), updatePublication);
router.delete('/:id', authMiddleware, deletePublication);

export default router;
