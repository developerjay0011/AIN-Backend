import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

/**
 * Leadership role → administration_members id mapping
 */
const LEADERSHIP_IDS = {
  DIRECTOR_MESSAGE: 'director',
  PRINCIPAL_MESSAGE: 'principal',
  REGISTRAR_MESSAGE: 'registrar',
} as const;

type LeadershipKey = keyof typeof LEADERSHIP_IDS;

/**
 * Get all About Us content (Milestones and Leadership Messages)
 * Leadership messages are sourced from administration_members (single source of truth).
 */
export const getAboutContent = asyncHandler(async (req: Request, res: Response) => {
  // Fetch milestones from settings
  const [milestoneRows] = await pool.query(
    `SELECT key_name, value, type FROM settings WHERE key_name = 'ABOUT_MILESTONES'`
  );

  const content: Record<string, any> = {
    ABOUT_MILESTONES: [],
    DIRECTOR_MESSAGE: { name: '', image: null, quote: '', body: '' },
    PRINCIPAL_MESSAGE: { name: '', image: null, quote: '', body: '' },
    REGISTRAR_MESSAGE: { name: '', image: null, quote: '', body: '' },
  };

  (milestoneRows as any[]).forEach(row => {
    let value = row.value;
    if (row.type === 'json' || (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{')))) {
      try { value = JSON.parse(row.value); } catch { value = row.value; }
    }
    content[row.key_name] = value;
  });

  // Fetch leadership messages from administration_members
  const [leaderRows] = await pool.query(
    `SELECT id, name, imageUrl, quote, description
     FROM administration_members
     WHERE id IN ('director', 'principal', 'registrar')`
  );

  (leaderRows as any[]).forEach((row: any) => {
    const keyMap: Record<string, LeadershipKey> = {
      director: 'DIRECTOR_MESSAGE',
      principal: 'PRINCIPAL_MESSAGE',
      registrar: 'REGISTRAR_MESSAGE',
    };
    const key = keyMap[row.id];
    if (key) {
      content[key] = {
        name: row.name || '',
        image: row.imageUrl || null,
        quote: row.quote || '',
        body: row.description || '',
      };
    }
  });

  res.json(ApiResponse.success(formatDataUrls(content, ['image']), 'About content fetched successfully'));
});

/**
 * Update About Us content
 * Leadership messages are written to administration_members (single source of truth).
 * Milestones remain in settings.
 */
export const updateAboutContent = asyncHandler(async (req: Request, res: Response) => {
  const content = req.body.data ? JSON.parse(req.body.data) : req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

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

  // ── Milestones: write to settings ────────────────────────────────────────
  if (sanitizedContent['ABOUT_MILESTONES'] !== undefined) {
    await pool.query(
      'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
      [JSON.stringify(sanitizedContent['ABOUT_MILESTONES']), 'ABOUT_MILESTONES']
    );
  }

  // ── Leadership messages: write to administration_members ──────────────────
  const fileFieldMap: Record<LeadershipKey, string> = {
    DIRECTOR_MESSAGE: 'director_image',
    PRINCIPAL_MESSAGE: 'principal_image',
    REGISTRAR_MESSAGE: 'registrar_image',
  };

  for (const [msgKey, adminId] of Object.entries(LEADERSHIP_IDS) as [LeadershipKey, string][]) {
    const incoming = sanitizedContent[msgKey];
    if (incoming === undefined) continue;

    // Fetch current row to preserve existing image if no new one
    const [existingRows]: any = await pool.query(
      'SELECT name, imageUrl, quote, description FROM administration_members WHERE id = ?',
      [adminId]
    );
    if (existingRows.length === 0) continue;
    const existing = existingRows[0];

    // Resolve image: uploaded file > passed URL > existing in DB
    const fileKey = fileFieldMap[msgKey];
    const newImagePath = (files && files[fileKey] && files[fileKey].length > 0)
      ? getUploadPath(files[fileKey][0])
      : null;

    const finalImage = newImagePath || incoming.image || existing.imageUrl || null;

    await pool.query(
      `UPDATE administration_members
       SET name        = COALESCE(?, name),
           quote       = ?,
           description = ?,
           imageUrl    = COALESCE(?, imageUrl),
           updatedAt   = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        incoming.name || existing.name || null,
        incoming.quote !== undefined ? incoming.quote : (existing.quote || ''),
        incoming.body !== undefined ? incoming.body : (existing.description || ''),
        finalImage,
        adminId,
      ]
    );

    // Mirror update back to the linked staff row (if staffId is set)
    const [adminRows]: any = await pool.query(
      'SELECT staffId, imageUrl FROM administration_members WHERE id = ?',
      [adminId]
    );
    if (adminRows.length > 0 && adminRows[0].staffId) {
      await pool.query(
        `UPDATE staff
         SET name  = COALESCE(?, name),
             image = COALESCE(?, image),
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [incoming.name || null, finalImage || null, adminRows[0].staffId]
      );
    }
  }

  res.json(ApiResponse.success(null, 'About content updated successfully'));
});
