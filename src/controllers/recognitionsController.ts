import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- RECOGNITION TYPES ---

/**
 * Get all recognition types
 */
export const getAllRecognitionTypes = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM recognition_types ORDER BY name ASC');
  res.json(ApiResponse.success(rows, 'Recognition types fetched successfully'));
});

/**
 * Create a new recognition type
 */
export const createRecognitionType = asyncHandler(async (req: Request, res: Response) => {
  const { name } = sanitizeObject(req.body);
  if (!name) {
    throw new ApiError(400, 'Recognition type name is required');
  }

  const id = `type-${Date.now()}`;
  await pool.query('INSERT INTO recognition_types (id, name) VALUES (?, ?)', [id, name]);

  const [newRecord] = await pool.query('SELECT * FROM recognition_types WHERE id = ?', [id]);
  res.status(201).json(ApiResponse.success((newRecord as any)[0], 'Recognition type created successfully'));
});

/**
 * Update a recognition type
 */
export const updateRecognitionType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = sanitizeObject(req.body);
  if (!name) {
    throw new ApiError(400, 'Recognition type name is required');
  }

  const [result] = await pool.query('UPDATE recognition_types SET name = ? WHERE id = ?', [name, id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Recognition type not found');
  }

  const [updatedRecord] = await pool.query('SELECT * FROM recognition_types WHERE id = ?', [id]);
  res.json(ApiResponse.success((updatedRecord as any)[0], 'Recognition type updated successfully'));
});

/**
 * Delete a recognition type
 */
export const deleteRecognitionType = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM recognition_types WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Recognition type not found');
  }
  res.json(ApiResponse.success(null, 'Recognition type deleted successfully'));
});

// --- RECOGNITIONS ---

/**
 * Get all recognitions
 */
export const getAllRecognitions = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query(`
    SELECT r.*, t.name as recognitionTypeName 
    FROM recognitions r 
    LEFT JOIN recognition_types t ON r.recognitionTypeId = t.id 
    ORDER BY r.createdAt DESC
  `);
  res.json(ApiResponse.success(formatDataUrls(rows, ['image']), 'Recognitions fetched successfully'));
});

/**
 * Create a new recognition
 */
export const createRecognition = asyncHandler(async (req: Request, res: Response) => {
  const { title, details, recognitionTypeId } = sanitizeObject(req.body);
  if (!title) {
    throw new ApiError(400, 'Recognition title is required');
  }

  const image = req.file ? getUploadPath(req.file) : (req.body.image || null);
  const id = `recognition-${Date.now()}`;

  await pool.query(
    'INSERT INTO recognitions (id, title, details, image, recognitionTypeId) VALUES (?, ?, ?, ?, ?)',
    [id, title, details || null, image, recognitionTypeId || null]
  );

  const [newRecord] = await pool.query(`
    SELECT r.*, t.name as recognitionTypeName 
    FROM recognitions r 
    LEFT JOIN recognition_types t ON r.recognitionTypeId = t.id 
    WHERE r.id = ?
  `, [id]);

  res.status(201).json(ApiResponse.success(formatDataUrls((newRecord as any)[0], ['image']), 'Recognition created successfully'));
});

/**
 * Update a recognition
 */
export const updateRecognition = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, details, recognitionTypeId } = sanitizeObject(req.body);
  if (!title) {
    throw new ApiError(400, 'Recognition title is required');
  }

  const [existing]: any = await pool.query('SELECT * FROM recognitions WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new ApiError(404, 'Recognition not found');
  }

  const image = req.file ? getUploadPath(req.file) : (req.body.image || existing[0].image);

  await pool.query(
    'UPDATE recognitions SET title = ?, details = ?, image = ?, recognitionTypeId = ? WHERE id = ?',
    [title, details || null, image, recognitionTypeId || null, id]
  );

  const [updatedRecord] = await pool.query(`
    SELECT r.*, t.name as recognitionTypeName 
    FROM recognitions r 
    LEFT JOIN recognition_types t ON r.recognitionTypeId = t.id 
    WHERE r.id = ?
  `, [id]);

  res.json(ApiResponse.success(formatDataUrls((updatedRecord as any)[0], ['image']), 'Recognition updated successfully'));
});

/**
 * Delete a recognition
 */
export const deleteRecognition = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM recognitions WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Recognition not found');
  }
  res.json(ApiResponse.success(null, 'Recognition deleted successfully'));
});
