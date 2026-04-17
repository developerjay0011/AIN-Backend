import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const username = sanitizeString(req.body.username);
  const { password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  const admin = (admins as any[])[0];

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
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
