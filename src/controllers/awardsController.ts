import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

// --- AWARD TYPES ---

/**
 * Get all award types
 */
export const getAllAwardTypes = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM award_types ORDER BY name ASC');
  res.json(ApiResponse.success(rows, 'Award types fetched successfully'));
});

/**
 * Create a new award type
 */
export const createAwardType = asyncHandler(async (req: Request, res: Response) => {
  const { name } = sanitizeObject(req.body);
  if (!name) {
    throw new ApiError(400, 'Award type name is required');
  }

  const id = `type-${Date.now()}`;
  await pool.query('INSERT INTO award_types (id, name) VALUES (?, ?)', [id, name]);

  const [newRecord] = await pool.query('SELECT * FROM award_types WHERE id = ?', [id]);
  res.status(201).json(ApiResponse.success((newRecord as any)[0], 'Award type created successfully'));
});

/**
 * Update an award type
 */
export const updateAwardType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = sanitizeObject(req.body);
  if (!name) {
    throw new ApiError(400, 'Award type name is required');
  }

  const [result] = await pool.query('UPDATE award_types SET name = ? WHERE id = ?', [name, id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Award type not found');
  }

  const [updatedRecord] = await pool.query('SELECT * FROM award_types WHERE id = ?', [id]);
  res.json(ApiResponse.success((updatedRecord as any)[0], 'Award type updated successfully'));
});

/**
 * Delete an award type
 */
export const deleteAwardType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM award_types WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Award type not found');
  }
  res.json(ApiResponse.success(null, 'Award type deleted successfully'));
});

// --- AWARDS ---

/**
 * Get all awards
 */
export const getAllAwards = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query(`
    SELECT a.*, t.name as awardTypeName 
    FROM awards a 
    LEFT JOIN award_types t ON a.awardTypeId = t.id 
    ORDER BY a.createdAt DESC
  `);
  res.json(ApiResponse.success(formatDataUrls(rows, ['image']), 'Awards fetched successfully'));
});

/**
 * Create a new award
 */
export const createAward = asyncHandler(async (req: Request, res: Response) => {
  const { title, details, awardTypeId } = sanitizeObject(req.body);
  if (!title) {
    throw new ApiError(400, 'Award title is required');
  }

  const image = req.file ? getUploadPath(req.file) : (req.body.image || null);
  const id = `award-${Date.now()}`;

  await pool.query(
    'INSERT INTO awards (id, title, details, image, awardTypeId) VALUES (?, ?, ?, ?, ?)',
    [id, title, details || null, image, awardTypeId || null]
  );

  const [newRecord] = await pool.query(`
    SELECT a.*, t.name as awardTypeName 
    FROM awards a 
    LEFT JOIN award_types t ON a.awardTypeId = t.id 
    WHERE a.id = ?
  `, [id]);

  res.status(201).json(ApiResponse.success(formatDataUrls((newRecord as any)[0], ['image']), 'Award created successfully'));
});

/**
 * Update an award
 */
export const updateAward = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, details, awardTypeId } = sanitizeObject(req.body);
  if (!title) {
    throw new ApiError(400, 'Award title is required');
  }

  const [existing]: any = await pool.query('SELECT * FROM awards WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new ApiError(404, 'Award not found');
  }

  const image = req.file ? getUploadPath(req.file) : (req.body.image || existing[0].image);

  await pool.query(
    'UPDATE awards SET title = ?, details = ?, image = ?, awardTypeId = ? WHERE id = ?',
    [title, details || null, image, awardTypeId || null, id]
  );

  const [updatedRecord] = await pool.query(`
    SELECT a.*, t.name as awardTypeName 
    FROM awards a 
    LEFT JOIN award_types t ON a.awardTypeId = t.id 
    WHERE a.id = ?
  `, [id]);

  res.json(ApiResponse.success(formatDataUrls((updatedRecord as any)[0], ['image']), 'Award updated successfully'));
});

/**
 * Delete an award
 */
export const deleteAward = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM awards WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Award not found');
  }
  res.json(ApiResponse.success(null, 'Award deleted successfully'));
});
