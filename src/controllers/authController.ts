import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Memory store for consumed CAPTCHA tokens with TTL to prevent replay attacks
 */
const consumedCaptchaTokens = new Map<string, number>();

// Clean up expired consumed tokens every 5 minutes (tokens valid for 5 mins)
setInterval(() => {
  const now = Date.now();
  for (const [token, timestamp] of consumedCaptchaTokens.entries()) {
    if (now - timestamp > 10 * 60 * 1000) {
      consumedCaptchaTokens.delete(token);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Helper to verify CAPTCHA token and answer (with replay attack prevention)
 */
const verifyCaptcha = (token: string, answer: string) => {
  if (process.env.NODE_ENV === 'development' && (!token || !answer)) {
    return;
  }
  if (!token || !answer) {
    throw new ApiError(400, 'CAPTCHA verification is required');
  }

  // Check if token has already been consumed (Replay Attack Prevention)
  if (consumedCaptchaTokens.has(token)) {
    throw new ApiError(400, 'CAPTCHA token has already been used. Please refresh the security check.');
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

  // Mark token as consumed to prevent reuse regardless of match outcome
  consumedCaptchaTokens.set(token, Date.now());

  if (expected !== received) {
    throw new ApiError(400, 'Incorrect CAPTCHA answer. Please try again.');
  }
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const username = sanitizeString(req.body.username);
  const { password, captchaToken, captchaAnswer } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  // Verify CAPTCHA (Single-Use Token Validation)
  verifyCaptcha(captchaToken, captchaAnswer);

  const [admins] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  const admin = (admins as any[])[0];

  let isMatch = false;

  if (admin) {
    // 1. Direct bcrypt comparison (matches client SHA-256 hash against stored bcrypt hash)
    isMatch = await bcrypt.compare(password, admin.password);

    // 2. Legacy fallback & auto-upgrade: if DB holds bcrypt of plaintext 'admin123' but client sent SHA-256
    const defaultSha256 = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
    if (!isMatch && password === defaultSha256) {
      if (await bcrypt.compare('admin123', admin.password)) {
        isMatch = true;
        // Auto-upgrade database record to bcrypt(sha256(password))
        const upgradedHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE admins SET password = ? WHERE id = ?', [upgradedHash, admin.id]);
      }
    }
  }

  if (!admin || !isMatch) {
    console.warn(`🚨 FAILED LOGIN ATTEMPT: User "${username}" from IP ${req.ip}`);
    throw new ApiError(401, 'Incorrect username or password. Please try again.');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set');

  // Generate unique session ID for single-session enforcement (prevents concurrent logins on different browsers)
  const sessionId = crypto.randomUUID();
  await pool.query('UPDATE admins SET currentSessionId = ? WHERE id = ?', [sessionId, admin.id]);

  // Token expiration managed via env variable (defaults to 2m)
  const expiresIn = process.env.JWT_EXPIRES_IN || '2m';
  const token = jwt.sign(
    { id: admin.id, username: admin.username, sessionId },
    jwtSecret,
    { expiresIn: expiresIn as any }
  );

  // Set HttpOnly, Secure cookie to mitigate CWE-614 and protect session tokens against XSS theft
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });

  res.json(ApiResponse.success({
    token,
    user: { id: admin.id, username: admin.username }
  }, 'Login successful'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Invalidate current session in DB if token is present
  const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded: any = jwt.verify(token, jwtSecret, { ignoreExpiration: true });
        if (decoded?.id) {
          await pool.query('UPDATE admins SET currentSessionId = NULL WHERE id = ?', [decoded.id]);
        }
      }
    } catch {
      // ignore
    }
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    path: '/'
  });
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

export default { login, logout };
