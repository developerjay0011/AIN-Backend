import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as aqarController from '../controllers/aqarController.js';

const router = Router();

router.get('/', aqarController.getAllAqars);
router.post('/', categoryUpload('aqar').fields([
  { name: 'document', maxCount: 1 }
]), aqarController.handleAqarPost);
router.delete('/:id', aqarController.deleteAqar);
router.post('/metrics/save', aqarController.updateInstitutionalHighlights);

export default router;
