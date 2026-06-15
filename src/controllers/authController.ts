import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
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

  let decoded: { captcha: string };
  try {
    decoded = jwt.verify(token, jwtSecret) as { captcha: string };
  } catch (error: any) {
    throw new ApiError(401, 'CAPTCHA expired or invalid. Please refresh.');
  }

  if (!decoded || !decoded.captcha) {
    throw new ApiError(400, 'Invalid CAPTCHA token structure');
  }

  const expected = decoded.captcha.toUpperCase();
  const received = answer.trim().toUpperCase();

  if (expected !== received) {
    throw new ApiError(400, 'Incorrect CAPTCHA answer. Please try again.');
  }
};


import { asyncHandler } from '../utils/asyncHandler.js';

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
    throw new ApiError(401, 'Incorrect username or password. Please try again.');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set');

  // Token expiration managed via env variable (defaults to 2m)
  const expiresIn = process.env.JWT_EXPIRES_IN || '2m';
  const token = jwt.sign({ id: admin.id, username: admin.username }, jwtSecret, { expiresIn: expiresIn as any });

  res.json(ApiResponse.success({
    token,
    user: { id: admin.id, username: admin.username }
  }, 'Login successful'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

export default { login, logout };
