import express from 'express';
import { getDepartments, updateDepartment } from '../controllers/departmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDepartments);
router.put('/:id', authMiddleware, updateDepartment);

export default router;
