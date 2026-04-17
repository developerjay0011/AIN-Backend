import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiResponse.js';
import { Request, Response, NextFunction } from 'express';

// Routes that require authentication even for GET requests
const PROTECTED_GET_PATHS = [
  '/api/admins',
  '/api/dashboard/stats',
  '/api/inquiries'
];

/**
 * PUBLIC_PATHS: Routes that are allowed for POST/PUT/DELETE without auth.
 * Usually auth routes and public form submissions.
 */
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/inquiries/contact',
  '/api/inquiries/admission'
];

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Allow all GET requests BY DEFAULT (to support public frontend)
  // EXCEPT for specific administrative paths defined in PROTECTED_GET_PATHS
  if (req.method === 'GET') {
    const isProtected = PROTECTED_GET_PATHS.some(path => req.path.startsWith(path));
    if (!isProtected) {
      return next();
    }
  }

  // 2. Allow explicit public POST/PUT/DELETE paths
  if (PUBLIC_PATHS.includes(req.path)) {
    return next();
  }

  // 3. For everything else, require a valid Bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required (Bearer token)');
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set');

  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};


