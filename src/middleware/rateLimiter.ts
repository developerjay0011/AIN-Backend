import { rateLimit } from 'express-rate-limit';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Helper to extract client IP behind reverse proxies (Cloudflare, Nginx, cPanel)
 */
const getClientIp = (req: any): string => {
  return (
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

/**
 * General API rate limiter
 * Protects all /api endpoints from volumetric denial-of-service / brute-force attacks.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 300, // 300 requests per 15 minutes in production
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.'
    });
  }
});

/**
 * Strict Login rate limiter (CWE-799 Remediation)
 * Restricts brute-force and credential-stuffing attacks on the authentication endpoint.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 5, // 5 login attempts per 15 minutes in production
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
    });
  }
});

/**
 * CAPTCHA generation rate limiter
 * Prevents automated scraping and token harvesting.
 */
export const captchaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isDev ? 500 : 30, // 30 CAPTCHAs per 5 minutes in production
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many CAPTCHA requests from this IP. Please try again after 5 minutes.'
    });
  }
});

/**
 * Public Inquiry form submission rate limiter
 * Protects admission and contact inquiries from automated spam.
 */
export const inquiryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isDev ? 1000 : 5, // 5 submissions per 5 minutes in production
  keyGenerator: getClientIp,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many inquiry submissions from this IP, please try again after 5 minutes'
    });
  }
});
