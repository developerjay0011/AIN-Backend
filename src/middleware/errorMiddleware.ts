import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiResponse.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;

  // Default to 500 if no status code is provided
  if (!statusCode) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  // Log the error for internal tracking (could use a logger like winston)
  console.error(`[ERROR] ${req.method} ${req.url}: ${message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};
