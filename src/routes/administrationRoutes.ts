import { Router } from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import * as administrationController from '../controllers/administrationController.js';

const router = Router();

router.get('/', administrationController.getAdministrationMembers);
router.delete('/:id', administrationController.deleteAdministrationMember);
router.post('/', categoryUpload('administration').single('image'), administrationController.handleAdministrationMemberPost);
router.post('/sort', administrationController.updateAdministrationSorting);

export default router;
