import { Router } from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Fetch global institutional statistics for the admin dashboard
 * @access  Private (Admin Only)
 */
router.get('/stats', (dashboardController as any).getDashboardStats);

export default router;
