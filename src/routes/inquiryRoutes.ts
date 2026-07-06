import express from 'express';
import { 
    createAdmissionInquiry, 
    getAdmissionInquiries, 
    updateAdmissionStatus, 
    deleteAdmissionInquiry,
    createContactInquiry,
    getContactInquiries,
    updateContactStatus,
    deleteContactInquiry
} from '../controllers/inquiryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Routes
 * These are used by the main website to submit new inquiries
 */
router.post('/admission', createAdmissionInquiry);
router.post('/contact', createContactInquiry);

/**
 * Protected Admin Routes
 * These require authentication to manage inquiries
 */
router.use(authMiddleware);

// Admission Management
router.get('/admission', getAdmissionInquiries);
router.put('/admission/:id', updateAdmissionStatus);
router.delete('/admission/:id', deleteAdmissionInquiry);

// Contact Management
router.get('/contact', getContactInquiries);
router.put('/contact/:id', updateContactStatus);
router.delete('/contact/:id', deleteContactInquiry);

export default router;
