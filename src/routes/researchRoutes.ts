import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getResearchData,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  createIrcMember,
  updateIrcMember,
  deleteIrcMember,
  createBulletin,
  updateBulletin,
  deleteBulletin,
  updateResearchCell
} from '../controllers/researchController.js';

const router = Router();

// GET all research data (public)
router.get('/', getResearchData);

// Cell Overview update
router.put('/cell', authMiddleware, categoryUpload('research').any(), updateResearchCell);

// Initiatives CRUD
router.post('/initiatives', authMiddleware, createInitiative);
router.put('/initiatives/:id', authMiddleware, updateInitiative);
router.delete('/initiatives/:id', authMiddleware, deleteInitiative);

// IRC Members CRUD
router.post('/irc-members', authMiddleware, createIrcMember);
router.put('/irc-members/:id', authMiddleware, updateIrcMember);
router.delete('/irc-members/:id', authMiddleware, deleteIrcMember);

// Bulletins CRUD
router.post('/bulletins', authMiddleware, categoryUpload('research').any(), createBulletin);
router.put('/bulletins/:id', authMiddleware, categoryUpload('research').any(), updateBulletin);
router.delete('/bulletins/:id', authMiddleware, deleteBulletin);

export default router;
