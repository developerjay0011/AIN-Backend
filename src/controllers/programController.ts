import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject, sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all programs with their associated courses
 */
export const getAllPrograms = asyncHandler(async (req: Request, res: Response) => {
  const [programRows] = await pool.query('SELECT * FROM programs ORDER BY createdAt DESC');
  const [courseRows] = await pool.query('SELECT * FROM courses ORDER BY createdAt DESC');

  const formattedCourses = formatDataUrls(courseRows, ['image']);
  const programs = (programRows as any[]).map(prog => {
    return {
      ...prog,
      courses: (formattedCourses as any[]).filter(course => course.programId === prog.id)
    };
  });

  res.json(ApiResponse.success(programs, 'Programs and courses fetched successfully'));
});

/**
 * Create a new program
 */
export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = sanitizeObject(req.body);

  if (!name) {
    throw new ApiError(400, 'Program name is required');
  }

  const id = `PROG-${Date.now()}`;
  await pool.query(
    'INSERT INTO programs (id, name, description) VALUES (?, ?, ?)',
    [id, name, description || null]
  );

  const [newRecord] = await pool.query('SELECT * FROM programs WHERE id = ?', [id]);
  const program = (newRecord as any)[0];
  program.courses = [];

  res.status(201).json(ApiResponse.success(program, 'Program created successfully'));
});

/**
 * Update a program
 */
export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = sanitizeObject(req.body);

  if (!name) {
    throw new ApiError(400, 'Program name is required');
  }

  const [result] = await pool.query(
    'UPDATE programs SET name = ?, description = ? WHERE id = ?',
    [name, description || null, id]
  );

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Program not found');
  }

  const [updatedRecord] = await pool.query('SELECT * FROM programs WHERE id = ?', [id]);
  const [courseRows] = await pool.query('SELECT * FROM courses WHERE programId = ?', [id]);

  const program = (updatedRecord as any)[0];
  program.courses = formatDataUrls(courseRows, ['image']);

  res.json(ApiResponse.success(program, 'Program updated successfully'));
});

/**
 * Delete a program
 */
export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM programs WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Program not found');
  }

  res.json(ApiResponse.success(null, 'Program deleted successfully'));
});

/**
 * Add a course to a program
 */
export const addCourse = asyncHandler(async (req: Request, res: Response) => {
  const { programId } = req.params;
  const { title, description } = sanitizeObject(req.body);

  if (!title) {
    throw new ApiError(400, 'Course title is required');
  }

  // Check if program exists
  const [programExists]: any = await pool.query('SELECT id FROM programs WHERE id = ?', [programId]);
  if (programExists.length === 0) {
    throw new ApiError(404, 'Program not found');
  }

  const image = req.file ? getUploadPath(req.file) : (req.body.image || null);
  const id = `CRS-${Date.now()}`;

  await pool.query(
    'INSERT INTO courses (id, programId, image, title, description) VALUES (?, ?, ?, ?, ?)',
    [id, programId, image, title, description || null]
  );

  const [newRecord] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
  res.status(201).json(ApiResponse.success(formatDataUrls((newRecord as any)[0], ['image']), 'Course added successfully'));
});

/**
 * Update a course
 */
export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = sanitizeObject(req.body);

  if (!title) {
    throw new ApiError(400, 'Course title is required');
  }

  const [existing]: any = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new ApiError(404, 'Course not found');
  }

  const image = req.file ? getUploadPath(req.file) : (req.body.image || existing[0].image);

  await pool.query(
    'UPDATE courses SET title = ?, description = ?, image = ? WHERE id = ?',
    [title, description || null, image, id]
  );

  const [updatedRecord] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
  res.json(ApiResponse.success(formatDataUrls((updatedRecord as any)[0], ['image']), 'Course updated successfully'));
});

/**
 * Delete a course
 */
export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Course not found');
  }

  res.json(ApiResponse.success(null, 'Course deleted successfully'));
});
