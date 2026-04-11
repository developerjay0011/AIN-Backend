import { Router } from 'express';
import * as aqarController from '../controllers/aqarController.js';
import { upload } from '../config/uploadConfig.js';

const router = Router();

router.get('/', aqarController.getAllAqars);
router.post('/', upload.fields([
  { name: 'document', maxCount: 1 }
]), aqarController.handleAqarPost);
router.delete('/:id', aqarController.deleteAqar);

// Simplified Institutional Quality Metrics (Fixed Highlights)
router.post('/metrics/save', aqarController.updateInstitutionalHighlights);

export default router;
