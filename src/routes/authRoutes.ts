import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { generateCaptcha } from '../controllers/captchaController.js';
import { loginLimiter, captchaLimiter } from '../middleware/rateLimiter.js';
import { login, logout, changePassword } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/change-password', authMiddleware, changePassword);
router.get('/captcha', captchaLimiter, generateCaptcha);

export default router;
