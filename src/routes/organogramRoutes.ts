import { Router } from 'express';
import * as organogramController from '../controllers/organogramController.js';

const router = Router();

router.get('/', organogramController.getOrganogramNodes);
router.delete('/:id', organogramController.deleteOrganogramNode);
router.post('/', organogramController.handleOrganogramNodePost);
router.post('/sort', organogramController.updateOrganogramSorting);

export default router;
