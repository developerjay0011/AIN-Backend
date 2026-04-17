import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';
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
      fileMap[file.fieldname] = `/uploads/images/${file.filename}`;
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
    const imageUrl = fileMap[fieldName] || m.imageUrl || m.img; // Support both naming conventions

    if (!m.id || m.id === '0' || m.id === 0) {
      // Insert
      const newId = `ALM-${Date.now()}-${i}`;
      await pool.query(
        'INSERT INTO alumni_milestones (id, year, title, description, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, sanitizeString(m.year), sanitizeString(m.title), sanitizeString(m.description || m.desc), imageUrl, i]
      );
    } else {
      // Update
      await pool.query(
        'UPDATE alumni_milestones SET year = ?, title = ?, description = ?, imageUrl = ?, sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [sanitizeString(m.year), sanitizeString(m.title), sanitizeString(m.description || m.desc), imageUrl, i, m.id]
      );
    }
  }

  const [finalRows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(formatDataUrls(finalRows), 'Alumni history synchronized successfully'));
});
