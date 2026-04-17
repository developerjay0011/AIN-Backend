import pool from '../config/db.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;
  let query = 'SELECT * FROM staff';
  let params: any[] = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  const [rows] = await pool.query(query, params);
  res.json(ApiResponse.success(formatDataUrls(rows), 'Staff members fetched successfully'));
});

export const handleStaffPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, role, type, qualification, experience, specialization, department } = sanitizeObject(req.body);
  const image = req.file ? `/uploads/images/${req.file.filename}` : req.body.image;

  if (id === '0' || !id || id === 0) {
    // Create Logic
    if (!name || !type) {
      throw new ApiError(400, 'Name and Type are required');
    }

    const newId = `STF-${Date.now()}`;
    const query = `
      INSERT INTO staff (id, name, role, type, image, qualification, experience, specialization, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [newId, name, role, type, image, qualification, experience, specialization, department]);

    const [newMember] = await pool.query('SELECT * FROM staff WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newMember as any)[0]), 'Staff member created successfully'));
  } else {
    // Update Logic
    const [existing] = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Staff member not found');
    }

    let query = `
      UPDATE staff 
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          type = COALESCE(?, type),
          qualification = COALESCE(?, qualification),
          experience = COALESCE(?, experience),
          specialization = COALESCE(?, specialization),
          department = COALESCE(?, department),
          updatedAt = CURRENT_TIMESTAMP
    `;

    const params = [name, role, type, qualification, experience, specialization, department];

    if (image !== undefined) {
      query += ', image = ?';
      params.push(image);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);

    const [updatedMember] = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedMember as any)[0]), 'Staff member updated successfully'));
  }
});

export const deleteStaffMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Staff member not found');
  }

  res.json(ApiResponse.success(null, 'Staff member deleted successfully'));
});
