import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { Request, Response } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all Alumni Milestones
 */
export const getAlumniHistory = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC, year DESC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Alumni history fetched successfully'));
});

/**
 * Update/Sync Alumni History
 * Handles bulk updates including reordering and image uploads
 */
export const syncAlumniHistory = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body.data ? JSON.parse(req.body.data) : req.body;
  const milestones = data.milestones || [];
  const files = req.files as Express.Multer.File[] | undefined;

  if (!Array.isArray(milestones)) {
    throw new ApiError(400, 'Invalid milestones data');
  }

  // Map uploaded files to fieldnames (e.g., "milestone_image_0")
  const fileMap: Record<string, string> = {};
  if (files) {
    files.forEach(file => {
      fileMap[file.fieldname] = getUploadPath(file) || '';
    });
  }

  // Identify milestones to delete
  const [currentRows] = await pool.query('SELECT id FROM alumni_milestones');
  const currentIds = (currentRows as any[]).map(row => row.id);
  const incomingIds = milestones.map((m: any) => m.id).filter((id: any) => id && id !== '0');
  const idsToDelete = currentIds.filter(id => !incomingIds.includes(id));

  if (idsToDelete.length > 0) {
    await pool.query('DELETE FROM alumni_milestones WHERE id IN (?)', [idsToDelete]);
  }

  // Insert or Update milestones
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const imageKey = `milestone_image_${i}`;
    const imageUrl = fileMap[imageKey] || m.imageUrl || null;

    const payload = [
      sanitizeString(m.year) || null,
      sanitizeString(m.title) || null,
      sanitizeString(m.description || m.desc) || null,
      imageUrl,
      i // sortOrder
    ];

    if (!m.id || m.id === '0' || m.id === 0) {
      const newId = `ALM-${Date.now()}-${i}`;
      await pool.query(
        'INSERT INTO alumni_milestones (id, year, title, description, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, ...payload]
      );
    } else {
      await pool.query(
        'UPDATE alumni_milestones SET year = ?, title = ?, description = ?, imageUrl = ?, sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [...payload, m.id]
      );
    }
  }

  const [finalRows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(formatDataUrls(finalRows, ['imageUrl']), 'Alumni history synchronized successfully'));
});
