import { Router } from 'express';
import { upload, categoryUpload } from '../config/uploadConfig.js';
import * as noticeController from '../controllers/noticeController.js';

const router = Router();

router.get('/', noticeController.getAllNotices);
router.post('/', categoryUpload('notices').fields([
  { name: 'document', maxCount: 1 },
  { name: 'formFile', maxCount: 1 }
]), noticeController.handleNoticePost);
router.delete('/:id', noticeController.deleteNotice);

export default router;
