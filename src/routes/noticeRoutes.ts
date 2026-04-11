import { Router } from 'express';
import * as noticeController from '../controllers/noticeController.js';
import { upload } from '../config/uploadConfig.js';

const router = Router();

router.get('/', noticeController.getAllNotices);
router.post('/', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'formFile', maxCount: 1 }
]), noticeController.handleNoticePost);
router.delete('/:id', noticeController.deleteNotice);

export default router;
