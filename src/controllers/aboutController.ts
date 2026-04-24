import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { Request, Response } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
      try { value = JSON.parse(row.value); } catch { value = row.value; }
    }
    content[row.key_name] = value;
  });

  // Ensure all keys exist with default structures
  keys.forEach(key => {
    if (!content[key]) content[key] = key === 'ABOUT_MILESTONES' ? [] : { quote: '', body: '', image: null };
  });

  res.json(ApiResponse.success(formatDataUrls(content, ['image']), 'About content fetched successfully'));
});

/**
 * Update About Us content
 */
export const updateAboutContent = asyncHandler(async (req: Request, res: Response) => {
  const content = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  if (!content || typeof content !== 'object') {
    throw new ApiError(400, 'Invalid content data provided');
  }

  const allowedKeys = ['ABOUT_MILESTONES', 'DIRECTOR_MESSAGE', 'PRINCIPAL_MESSAGE', 'REGISTRAR_MESSAGE'];
  
  // Helper for deep sanitization
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
  const placeholders = allowedKeys.map(() => '?').join(',');
  const [existingRows] = await pool.query(`SELECT key_name, value FROM settings WHERE key_name IN (${placeholders})`, allowedKeys);
  
  const existingMap: Record<string, any> = {};
  (existingRows as any[]).forEach(row => {
    try { existingMap[row.key_name] = JSON.parse(row.value); } catch { existingMap[row.key_name] = row.value; }
  });

  for (const key of allowedKeys) {
    if (sanitizedContent[key] === undefined) continue;

    let finalValue = sanitizedContent[key];

    // Merge logic for leadership messages to preserve images
    if (['DIRECTOR_MESSAGE', 'PRINCIPAL_MESSAGE', 'REGISTRAR_MESSAGE'].includes(key)) {
      const existing = existingMap[key] || {};
      const incoming = sanitizedContent[key] || {};
      
      const fileFieldMap: Record<string, string> = {
        'DIRECTOR_MESSAGE': 'director_image',
        'PRINCIPAL_MESSAGE': 'principal_image',
        'REGISTRAR_MESSAGE': 'registrar_image'
      };
      
      const fileKey = fileFieldMap[key];
      const newImagePath = (files && files[fileKey]) ? getUploadPath(files[fileKey][0]) : null;

      finalValue = {
        ...existing,
        ...incoming,
        image: newImagePath || incoming.image || existing.image || null
      };
    }

    await pool.query(
      'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
      [JSON.stringify(finalValue), key]
    );
  }

  res.json(ApiResponse.success(null, 'About content updated successfully'));
});
