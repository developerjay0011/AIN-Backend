import { Router } from 'express';
import * as staffController from '../controllers/staffController.js';
import { upload } from '../config/uploadConfig.js';

const router = Router();

router.get('/', staffController.getAllStaff);
router.delete('/:id', staffController.deleteStaffMember);
router.post('/', upload.single('image'), staffController.handleStaffPost);

export default router;
