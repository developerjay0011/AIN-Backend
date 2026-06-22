import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

/**
 * Get all About Us content (Milestones, Story, Overview, Vision, Mission, Objectives, Anthem)
 */
export const getAboutContent = asyncHandler(async (req: Request, res: Response) => {
  // Fetch milestones and text content from settings
  const settingKeys = [
    'ABOUT_MILESTONES', 'ABOUT_ANTHEM', 'ABOUT_OUR_STORY',
    'ABOUT_OVERVIEW', 'ABOUT_VISION', 'ABOUT_MISSION', 'ABOUT_OBJECTIVES'
  ];
  const placeholders = settingKeys.map(() => '?').join(',');
  const [settingRows] = await pool.query(
    `SELECT key_name, value, type FROM settings WHERE key_name IN (${placeholders})`,
    settingKeys
  );

  const content: Record<string, any> = {
    ABOUT_MILESTONES: [],
    ABOUT_ANTHEM: '',
    ABOUT_OUR_STORY: '',
    ABOUT_OVERVIEW: '',
    ABOUT_VISION: '',
    ABOUT_MISSION: '',
    ABOUT_OBJECTIVES: '',
  };

  (settingRows as any[]).forEach(row => {
    let value = row.value;
    if (row.type === 'json' || (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{')))) {
      try { value = JSON.parse(row.value); } catch { value = row.value; }
    }
    content[row.key_name] = value;
  });

  res.json(ApiResponse.success(formatDataUrls(content, ['image']), 'About content fetched successfully'));
});

/**
 * Update About Us content
 */
export const updateAboutContent = asyncHandler(async (req: Request, res: Response) => {
  const content = req.body.data ? JSON.parse(req.body.data) : req.body;

  if (!content || typeof content !== 'object') {
    throw new ApiError(400, 'Invalid content data provided');
  }

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

  // ── Text Content & Milestones: write to settings ────────────────────────────────────────
  const settingKeys = [
    'ABOUT_MILESTONES', 'ABOUT_ANTHEM', 'ABOUT_OUR_STORY',
    'ABOUT_OVERVIEW', 'ABOUT_VISION', 'ABOUT_MISSION', 'ABOUT_OBJECTIVES'
  ];

  for (const key of settingKeys) {
    if (sanitizedContent[key] !== undefined) {
      const val = typeof sanitizedContent[key] === 'object' ? JSON.stringify(sanitizedContent[key]) : sanitizedContent[key];
      const type = typeof sanitizedContent[key] === 'object' ? 'json' : 'text';

      const [updateResult]: any = await pool.query(
        'UPDATE settings SET value = ?, type = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
        [val, type, key]
      );

      if (updateResult.affectedRows === 0) {
        await pool.query(
          'INSERT INTO settings (key_name, value, type) VALUES (?, ?, ?)',
          [key, val, type]
        );
      }
    }
  }

  res.json(ApiResponse.success(null, 'About content updated successfully'));
});
