import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAlumniHistory,
  syncAlumniHistory,
  getAlumniActivities,
  handleActivityPost,
  deleteActivity,
  getAlumniDirectory,
  handleDirectoryPost,
  deleteDirectoryMember,
  getAlumniExecutives,
  handleExecutivePost,
  deleteExecutive
} from '../controllers/alumniController.js';

const router = Router();

// Milestones
router.get('/history', getAlumniHistory);
router.put('/history', authMiddleware, categoryUpload('alumni').any(), syncAlumniHistory);

// Activities
router.get('/activities', getAlumniActivities);
router.post('/activities', authMiddleware, categoryUpload('alumni').single('image'), handleActivityPost);
router.delete('/activities/:id', authMiddleware, deleteActivity);

// Directory/Members
router.get('/directory', getAlumniDirectory);
router.post('/directory', authMiddleware, categoryUpload('alumni').single('image'), handleDirectoryPost);
router.delete('/directory/:id', authMiddleware, deleteDirectoryMember);

// Executives
router.get('/executives', getAlumniExecutives);
router.post('/executives', authMiddleware, categoryUpload('alumni').single('image'), handleExecutivePost);
router.delete('/executives/:id', authMiddleware, deleteExecutive);

export default router;
