import { Request, Response, NextFunction } from 'express';
import { sanitizeDeep } from '../utils/sanitize.js';

/**
 * Global Input Sanitization Middleware (CWE-20 Remediation)
 * Automatically cleans all incoming request bodies, queries, and URL parameters,
 * stripping HTML tags, XSS payloads, DOM event injections, and null bytes.
 */
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeDeep(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      (req.query as any)[key] = sanitizeDeep(req.query[key]);
    }
  }
  if (req.params && typeof req.params === 'object') {
    for (const key of Object.keys(req.params)) {
      (req.params as any)[key] = sanitizeDeep(req.params[key]);
    }
  }
  next();
};
