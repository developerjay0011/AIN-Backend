import pool from '../config/db.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;
  let query = 'SELECT * FROM staff';
  let params: any[] = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  const [rows] = await pool.query(query, params);
  res.json(ApiResponse.success(formatDataUrls(rows, ['image']), 'Staff members fetched successfully'));
});

export const handleStaffPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, role, type, qualification, experience, specialization, department } = sanitizeObject(req.body);
  const image = req.file ? getUploadPath(req.file) : (req.body.image || null);

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

    await pool.query(query, [
      newId,
      name || null,
      role || null,
      type || null,
      image,
      qualification || null,
      experience || null,
      specialization || null,
      department || null
    ]);

    const [newMember] = await pool.query('SELECT * FROM staff WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newMember as any)[0], ['image']), 'Staff member created successfully'));
  } else {
    // Update Logic
    const [existing]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Staff member not found');
    }

    const query = `
      UPDATE staff 
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          type = COALESCE(?, type),
          qualification = COALESCE(?, qualification),
          experience = COALESCE(?, experience),
          specialization = COALESCE(?, specialization),
          department = COALESCE(?, department),
          image = COALESCE(?, image),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [
      name || null,
      role || null,
      type || null,
      qualification || null,
      experience || null,
      specialization || null,
      department || null,
      image,
      id
    ]);

    const [updatedMember] = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedMember as any)[0], ['image']), 'Staff member updated successfully'));
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
