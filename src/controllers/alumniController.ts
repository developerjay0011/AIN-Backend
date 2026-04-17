import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Get all Alumni Milestones
 */
export const getAlumniHistory = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC, year DESC');
  res.json(ApiResponse.success(formatDataUrls(rows), 'Alumni history fetched successfully'));
});

/**
 * Update/Sync Alumni History
 * Handles bulk updates including reordering and image uploads
 */
export const syncAlumniHistory = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body.data ? JSON.parse(req.body.data) : req.body;
  const milestones = data.milestones || [];
  const files = req.files as Express.Multer.File[];

  if (!Array.isArray(milestones)) {
    throw new ApiError(400, 'Invalid milestones data');
  }

  // Handle files and map them to the correct milestones
  // We expect field names like "milestone_image_0", "milestone_image_1", etc.
  const fileMap: Record<string, string> = {};
  if (files && files.length > 0) {
    files.forEach(file => {
      fileMap[file.fieldname] = getUploadPath(file) || '';
    });
  }

  // Use a transaction-like sequential approach for atomic updates

  // First, get all current IDs to see what needs to be deleted
  const [currentRows] = await pool.query('SELECT id FROM alumni_milestones');
  const currentIds = (currentRows as any[]).map(row => row.id);
  const newIds = milestones.map((m: any) => m.id).filter((id: any) => id && id !== '0');

  const idsToDelete = currentIds.filter(id => !newIds.includes(id));

  // 1. Delete removed milestones
  if (idsToDelete.length > 0) {
    const placeholders = idsToDelete.map(() => '?').join(',');
    await pool.query(`DELETE FROM alumni_milestones WHERE id IN (${placeholders})`, idsToDelete);
  }

  // 2. Insert or Update remaining ones
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const fieldName = `milestone_image_${i}`;
    
    // Standardized image update pattern for alumni milestones
    const imageUrl = fileMap[fieldName] || (typeof m.imageUrl === 'string' && m.imageUrl.length > 0 ? m.imageUrl : null);

    if (!m.id || m.id === '0' || m.id === 0) {
      // Insert
      const newId = `ALM-${Date.now()}-${i}`;
      await pool.query(
        'INSERT INTO alumni_milestones (id, year, title, description, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, sanitizeString(m.year) || null, sanitizeString(m.title) || null, sanitizeString(m.description || m.desc) || null, imageUrl, i]
      );
    } else {
      // Update
      // Use COALESCE for imageUrl to preserve existing if null
      await pool.query(
        'UPDATE alumni_milestones SET year = COALESCE(?, year), title = COALESCE(?, title), description = COALESCE(?, description), imageUrl = COALESCE(?, imageUrl), sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [sanitizeString(m.year) || null, sanitizeString(m.title) || null, sanitizeString(m.description || m.desc) || null, imageUrl, i, m.id]
      );
    }
  }

  const [finalRows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(formatDataUrls(finalRows), 'Alumni history synchronized successfully'));
});
