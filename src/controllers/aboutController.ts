import pool from '../config/db.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Get all About Us content (Milestones and Leadership Messages)
 */
export const getAboutContent = asyncHandler(async (req: Request, res: Response) => {
  const keys = ['ABOUT_MILESTONES', 'DIRECTOR_MESSAGE', 'PRINCIPAL_MESSAGE', 'REGISTRAR_MESSAGE'];
  const placeholders = keys.map(() => '?').join(',');
  const [rows] = await pool.query(`SELECT key_name, value, type FROM settings WHERE key_name IN (${placeholders})`, keys);

  const content: Record<string, any> = {};
  (rows as any[]).forEach(row => {
    let value = row.value;
    if (row.type === 'json' || (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{')))) {
      try {
        value = JSON.parse(row.value);
      } catch (e) {
        value = row.value;
      }
    }
    content[row.key_name] = value;
  });

  // Ensure all keys exist in the response even if empty
  keys.forEach(key => {
    if (!content[key]) content[key] = key === 'ABOUT_MILESTONES' ? [] : { quote: '', body: '' };
  });

  res.json(ApiResponse.success(content, 'About content fetched successfully'));
});

/**
 * Update About Us content
 */
export const updateAboutContent = asyncHandler(async (req: Request, res: Response) => {
  // If using FormData, the numeric/JSON data might be in a 'data' field
  const content = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!content || typeof content !== 'object') {
    throw new ApiError(400, 'Invalid content data provided');
  }

  // Handle uploaded images
  if (files) {
    if (files['director_image']) {
      content.DIRECTOR_MESSAGE = {
        ...(content.DIRECTOR_MESSAGE || {}),
        image: `/uploads/images/${files['director_image'][0].filename}`
      };
    }
    if (files['principal_image']) {
      content.PRINCIPAL_MESSAGE = {
        ...(content.PRINCIPAL_MESSAGE || {}),
        image: `/uploads/images/${files['principal_image'][0].filename}`
      };
    }
    if (files['registrar_image']) {
      content.REGISTRAR_MESSAGE = {
        ...(content.REGISTRAR_MESSAGE || {}),
        image: `/uploads/images/${files['registrar_image'][0].filename}`
      };
    }
  }

  const allowedKeys = ['ABOUT_MILESTONES', 'DIRECTOR_MESSAGE', 'PRINCIPAL_MESSAGE', 'REGISTRAR_MESSAGE'];
  const entries = Object.entries(content);

  for (const [key, value] of entries) {
    if (!allowedKeys.includes(key)) continue;

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await pool.query(
      'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
      [stringValue, key]
    );
  }

  res.json(ApiResponse.success(null, 'About content updated successfully'));
});
