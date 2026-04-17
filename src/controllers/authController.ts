import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

/**
 * Helper to verify CAPTCHA token and answer
 */
const verifyCaptcha = (token: string, answer: string) => {
  if (!token || !answer) {
    throw new ApiError(400, 'CAPTCHA verification is required');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET not set');

  try {
    const decoded = jwt.verify(token, jwtSecret) as { captcha: string };
    if (decoded.captcha.toUpperCase() !== answer.toUpperCase()) {
      throw new ApiError(400, 'Incorrect CAPTCHA answer. Please try again.');
    }
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'CAPTCHA expired or invalid. Please refresh.');
  }
};


const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const username = sanitizeString(req.body.username);
  const { password, captchaToken, captchaAnswer } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  // Verify CAPTCHA
  verifyCaptcha(captchaToken, captchaAnswer);


  const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  const admin = (admins as any[])[0];

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    console.warn(`🚨 FAILED LOGIN ATTEMPT: User "${username}" from IP ${req.ip}`);
    throw new ApiError(401, 'Invalid credentials');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set');

  // Token expires in 7 days for security
  const token = jwt.sign({ id: admin.id, username: admin.username }, jwtSecret, { expiresIn: '7d' });

  res.json(ApiResponse.success({
    token,
    user: { id: admin.id, username: admin.username }
  }, 'Login successful'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

export default { login, logout };
