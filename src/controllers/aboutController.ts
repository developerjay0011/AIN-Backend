import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
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

  res.json(ApiResponse.success(formatDataUrls(content), 'About content fetched successfully'));
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

  if (files) {
    if (files['director_image']) {
      content.DIRECTOR_MESSAGE = {
        ...(content.DIRECTOR_MESSAGE || {}),
        image: getUploadPath(files['director_image'][0])
      };
    }
    if (files['principal_image']) {
      content.PRINCIPAL_MESSAGE = {
        ...(content.PRINCIPAL_MESSAGE || {}),
        image: getUploadPath(files['principal_image'][0])
      };
    }
    if (files['registrar_image']) {
      content.REGISTRAR_MESSAGE = {
        ...(content.REGISTRAR_MESSAGE || {}),
        image: getUploadPath(files['registrar_image'][0])
      };
    }
  }

  // Deep sanitize the content since it contains nested objects for settings
  const sanitizeDeep = (val: any): any => {
    if (Array.isArray(val)) return val.map(sanitizeDeep);
    if (val && typeof val === 'object') {
      const result: any = {};
      for (const k of Object.keys(val)) result[k] = sanitizeDeep(val[k]);
      return result;
    }
    return typeof val === 'string' ? sanitizeString(val) : val;
  };

  const sanitizedContent = sanitizeDeep(content);

  const allowedKeys = ['ABOUT_MILESTONES', 'DIRECTOR_MESSAGE', 'PRINCIPAL_MESSAGE', 'REGISTRAR_MESSAGE'];
  
  // Fetch existing settings first to merge correctly (preserving images if omitted)
  const placeholders = allowedKeys.map(() => '?').join(',');
  const [existingRows] = await pool.query(`SELECT key_name, value FROM settings WHERE key_name IN (${placeholders})`, allowedKeys);
  const existingMap: Record<string, any> = {};
  (existingRows as any[]).forEach(row => {
    try {
      existingMap[row.key_name] = JSON.parse(row.value);
    } catch {
      existingMap[row.key_name] = row.value;
    }
  });

  const entries = Object.entries(sanitizedContent);

  for (const [key, value] of entries) {
    if (!allowedKeys.includes(key)) continue;

    let finalValue = value;

    // Merge logic for leadership messages to preserve existing images if omitted
    if (['DIRECTOR_MESSAGE', 'PRINCIPAL_MESSAGE', 'REGISTRAR_MESSAGE'].includes(key)) {
        const existing = existingMap[key] || {};
        const incoming = (value as any) || {};
        
        // Standardized image update pattern for About settings
        const fieldMap: Record<string, string> = {
            'DIRECTOR_MESSAGE': 'director_image',
            'PRINCIPAL_MESSAGE': 'principal_image',
            'REGISTRAR_MESSAGE': 'registrar_image'
        };
        const fileKey = fieldMap[key];
        const newImagePath = (files && files[fileKey]) 
            ? getUploadPath(files[fileKey][0]) 
            : null;

        finalValue = {
            ...existing,
            ...incoming,
            // Prioritize new upload, then incoming string URL, then existing, then null
            image: newImagePath || (incoming.image && typeof incoming.image === 'string' ? incoming.image : null) || existing.image || null
        };
    }

    const stringValue = typeof finalValue === 'object' ? JSON.stringify(finalValue) : String(finalValue);
    await pool.query(
      'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
      [stringValue, key]
    );
  }

  res.json(ApiResponse.success(null, 'About content updated successfully'));
});
