import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getDepartments, updateDepartment, createDepartment } from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', authMiddleware, createDepartment);
router.put('/:id', authMiddleware, updateDepartment);

export default router;
