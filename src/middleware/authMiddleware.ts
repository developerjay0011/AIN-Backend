import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { ApiError } from '../utils/ApiResponse.js';
import { Request, Response, NextFunction } from 'express';

// Routes that require authentication even for GET requests
const PROTECTED_GET_PATHS = [
  '/api/admins',
  '/api/dashboard',
  '/api/inquiries',
  '/api/alumni/registrations'
];

/**
 * PUBLIC_PATHS: Routes that are allowed for POST/PUT/DELETE without auth.
 * Usually auth routes and public form submissions.
 */
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/inquiries/contact',
  '/api/inquiries/admission',
  '/api/alumni/register'
];

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const reqPath = req.originalUrl.split('?')[0];

  // 1. Allow all GET requests BY DEFAULT (to support public frontend)
  // EXCEPT for specific administrative paths defined in PROTECTED_GET_PATHS
  if (req.method === 'GET') {
    const isProtected = PROTECTED_GET_PATHS.some(path => reqPath.startsWith(path));
    if (!isProtected) {
      return next();
    }
  }

  // 2. Allow explicit public POST/PUT/DELETE paths
  if (PUBLIC_PATHS.includes(reqPath)) {
    return next();
  }

  // 3. For everything else, require a valid token (check HttpOnly cookie or Bearer header)
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return next(new Error('JWT_SECRET environment variable is not set'));

  try {
    const decoded: any = jwt.verify(token, jwtSecret);

    // Validate single-session integrity (Concurrent Login Prevention)
    if (decoded?.id && decoded?.sessionId) {
      const [rows]: any = await pool.query('SELECT currentSessionId FROM admins WHERE id = ?', [decoded.id]);
      if (rows.length > 0 && rows[0].currentSessionId && rows[0].currentSessionId !== decoded.sessionId) {
        return next(new ApiError(401, 'Your session has expired because this account was logged in from another browser or device.'));
      }
    }

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};


