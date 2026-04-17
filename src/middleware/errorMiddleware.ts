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

  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(isDev && { stack: err.stack })
  });

};

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};
