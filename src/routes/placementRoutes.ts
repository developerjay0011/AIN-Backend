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
  deletePlacementHighlight,
  getPlacementCollaborations,
  handlePlacementCollaborationPost,
  deletePlacementCollaboration,
  getPlacementResources,
  handlePlacementResourcePost,
  deletePlacementResource
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

// Placement Collaborations
router.get('/collaborations', getPlacementCollaborations);
router.post('/collaborations', authMiddleware, categoryUpload('placement').single('logo'), handlePlacementCollaborationPost);
router.delete('/collaborations/:id', authMiddleware, deletePlacementCollaboration);

// Placement Resources
router.get('/resources', getPlacementResources);
router.post('/resources', authMiddleware, categoryUpload('placement').single('file'), handlePlacementResourcePost);
router.delete('/resources/:id', authMiddleware, deletePlacementResource);

export default router;
