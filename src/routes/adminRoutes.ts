import { Router } from 'express';
import adminController from '../controllers/adminController.js';

const router = Router();

router.get('/', adminController.getAllAdmins);
router.post('/', adminController.createAdmin);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

export default router;
