import { Router } from 'express';
import { upload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllSettings, updateSettings, uploadLogo } from '../controllers/settingsController.js';

const router = Router();

router.get('/', getAllSettings);
router.post('/update', authMiddleware, updateSettings);
router.post('/upload-logo', authMiddleware, upload.single('logo'), uploadLogo);

export default router;
