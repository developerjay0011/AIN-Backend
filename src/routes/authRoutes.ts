import { Router } from 'express';
import { login, logout } from '../controllers/authController.js';
import { generateCaptcha } from '../controllers/captchaController.js';
import { loginLimiter, captchaLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/captcha', captchaLimiter, generateCaptcha);

export default router;
