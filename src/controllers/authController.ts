import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  const admin = (admins as any[])[0];

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const jwtSecret = process.env.JWT_SECRET || 'ain_institutional_portal_secret_2026';
  
  // Non-expiring token as requested (omitting expiresIn)
  const token = jwt.sign({ id: admin.id, username: admin.username }, jwtSecret);

  res.json(ApiResponse.success({
    token,
    user: { id: admin.id, username: admin.username }
  }, 'Login successful'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

export default { login, logout };
