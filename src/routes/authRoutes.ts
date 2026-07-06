import { Router } from 'express';
import { login, logout } from '../controllers/authController.js';
import { generateCaptcha } from '../controllers/captchaController.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/captcha', generateCaptcha);

export default router;
