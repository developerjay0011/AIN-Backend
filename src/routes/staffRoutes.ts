import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as staffController from '../controllers/staffController.js';

const router = Router();

router.get('/', staffController.getAllStaff);
router.delete('/:id', staffController.deleteStaffMember);
router.post('/', categoryUpload('staff').single('image'), staffController.handleStaffPost);

export default router;
