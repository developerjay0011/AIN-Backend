import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getPlacementMembers,
  handlePlacementMemberPost,
  deletePlacementMember,
  getPlacementStats,
  handlePlacementStatPost,
  deletePlacementStat,
  getPlacementHighlights,
  handlePlacementHighlightPost,
  deletePlacementHighlight
} from '../controllers/placementController.js';

const router = Router();

// Placement Members
router.get('/members', getPlacementMembers);
router.post('/members', authMiddleware, categoryUpload('placement').single('image'), handlePlacementMemberPost);
router.delete('/members/:id', authMiddleware, deletePlacementMember);

// Placement Stats
router.get('/stats', getPlacementStats);
router.post('/stats', authMiddleware, handlePlacementStatPost);
router.delete('/stats/:id', authMiddleware, deletePlacementStat);

// Placement Highlights
router.get('/highlights', getPlacementHighlights);
router.post('/highlights', authMiddleware, handlePlacementHighlightPost);
router.delete('/highlights/:id', authMiddleware, deletePlacementHighlight);

export default router;
