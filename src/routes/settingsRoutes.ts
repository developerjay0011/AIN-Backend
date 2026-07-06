import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllSettings, updateSettings, uploadLogo } from '../controllers/settingsController.js';

const router = Router();

router.get('/', getAllSettings);
router.post('/update', authMiddleware, updateSettings);
router.post('/upload-logo', authMiddleware, categoryUpload('settings').single('logo'), uploadLogo);

export default router;
