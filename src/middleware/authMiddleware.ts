import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiResponse.js';

// Routes that require authentication even for GET requests
const PROTECTED_GET_PATHS = [
  '/api/admins',
  '/api/dashboard/stats'
];

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isProtectedGet = req.method === 'GET' && PROTECTED_GET_PATHS.some(path => req.path.startsWith(path));

  // Skip auth for:
  // 1. Auth routes
  // 2. Root/Landing
  // 3. GET requests that are NOT in the protected list
  if (
    req.path === '/api/auth/login' ||
    req.path === '/login' ||
    req.path === '/' ||
    (req.method === 'GET' && !isProtectedGet)
  ) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required (Bearer token)');
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'ain_institutional_portal_secret_2026';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};
