import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getFacilitiesData,
  updateCampusFacility,
  updateCampusHero,
  updateHostelFacility,
  updateHostelDetails,
  updateSnaDetails,
  updateStudentSupport,
  uploadFacilityFile
} from '../controllers/facilityController.js';

const router = Router();

// Single unified public getter
router.get('/', getFacilitiesData);

// Admin setters (protected)
router.post('/sna/update', authMiddleware, updateSnaDetails);
router.post('/hostel/update', authMiddleware, updateHostelDetails);
router.post('/hostel-facility/update', authMiddleware, updateHostelFacility);
router.post('/campus/update', authMiddleware, updateCampusFacility);
router.post('/campus-hero/update', authMiddleware, updateCampusHero);
router.post('/support/update', authMiddleware, updateStudentSupport);

// Generic upload endpoint
router.post('/upload-file', authMiddleware, categoryUpload('facilities').single('file'), uploadFacilityFile);

export default router;
