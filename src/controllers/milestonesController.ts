import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls } from '../utils/urlHelper.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllAchievements = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM achievements ORDER BY date DESC');
  res.json(ApiResponse.success(formatDataUrls(rows), 'Achievements fetched successfully'));
});

export const handleAchievementPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, title, date, category, description } = req.body;
  const imageFile = (req as any).file;

  if (id === '0' || !id || id === 0) {
    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    const newId = `ACH-${Date.now()}`;
    const imageUrl = imageFile ? `uploads/images/${imageFile.filename}` : null;

    const query = `
      INSERT INTO achievements (id, title, date, category, description, imageUrl)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [newId, title, date, category, description, imageUrl]);

    const [newAchievement] = await pool.query('SELECT * FROM achievements WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newAchievement as any)[0]), 'Achievement created successfully'));
  } else {
    const [existing] = await pool.query('SELECT * FROM achievements WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Achievement not found');
    }

    const existingRecord = (existing as any)[0];
    const finalImageUrl = imageFile ? `uploads/images/${imageFile.filename}` : existingRecord.imageUrl;

    const query = `
      UPDATE achievements 
      SET title = COALESCE(?, title),
          date = COALESCE(?, date),
          category = COALESCE(?, category),
          description = COALESCE(?, description),
          imageUrl = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [title, date, category, description, finalImageUrl, id]);

    const [updatedAchievement] = await pool.query('SELECT * FROM achievements WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedAchievement as any)[0]), 'Achievement updated successfully'));
  }
});

export const deleteAchievement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM achievements WHERE id = ?', [id]);
  
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Achievement not found');
  }
  
  res.json(ApiResponse.success(null, 'Achievement deleted successfully'));
});
