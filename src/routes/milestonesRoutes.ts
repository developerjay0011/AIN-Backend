import { Router } from 'express';
import * as milestonesController from '../controllers/milestonesController.js';

const router = Router();

router.get('/', milestonesController.getAllAchievements);
router.post('/', milestonesController.handleAchievementPost);
router.delete('/:id', milestonesController.deleteAchievement);

export default router;
