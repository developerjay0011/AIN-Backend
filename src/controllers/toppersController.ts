import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls } from '../utils/urlHelper.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllToppers = asyncHandler(async (req: Request, res: Response) => {
  // Sort by rank number. Remove '#' and cast to integer.
  const query = `
    SELECT * FROM toppers 
    ORDER BY CAST(REPLACE(rank, '#', '') AS INTEGER) ASC, createdAt DESC
  `;
  const [rows] = await pool.query(query);
  res.json(ApiResponse.success(formatDataUrls(rows), 'Toppers fetched successfully'));
});

export const handleTopperPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, rankTag, rank } = req.body;
  // Support both req.file (physical) and req.body.image (base64 or existing URL)
  const image = req.file ? `/uploads/images/${req.file.filename}` : req.body.image;

  if (id === '0' || !id || id === 0) {
    if (!name) {
      throw new ApiError(400, 'Name is required');
    }

    const newId = `TOP-${Date.now()}`;
    const query = `
      INSERT INTO toppers (id, name, rankTag, rank, imageUrl)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(query, [newId, name, rankTag, rank, image]);

    const [newRecord] = await pool.query('SELECT * FROM toppers WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newRecord as any)[0]), 'Record created successfully'));
  } else {
    const [existing] = await pool.query('SELECT * FROM toppers WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Record not found');
    }

    const query = `
      UPDATE toppers 
      SET name = COALESCE(?, name),
          rankTag = COALESCE(?, rankTag),
          rank = COALESCE(?, rank),
          imageUrl = COALESCE(?, imageUrl),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [name, rankTag, rank, image, id]);

    const [updatedRecord] = await pool.query('SELECT * FROM toppers WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedRecord as any)[0]), 'Record updated successfully'));
  }
});

export const deleteTopper = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM toppers WHERE id = ?', [id]);
  
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Record not found');
  }
  
  res.json(ApiResponse.success(null, 'Record deleted successfully'));
});
