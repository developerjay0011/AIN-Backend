import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as programController from '../controllers/programController.js';

const router = Router();

// Public route to fetch programs
router.get('/', programController.getAllPrograms);

// Protected routes (require admin auth)
router.post('/', authMiddleware, programController.createProgram);
router.put('/:id', authMiddleware, programController.updateProgram);
router.delete('/:id', authMiddleware, programController.deleteProgram);

// Course endpoints under programs
router.post('/:programId/courses', authMiddleware, categoryUpload('courses').single('image'), programController.addCourse);
router.put('/courses/:id', authMiddleware, categoryUpload('courses').single('image'), programController.updateCourse);
router.delete('/courses/:id', authMiddleware, programController.deleteCourse);

export default router;
