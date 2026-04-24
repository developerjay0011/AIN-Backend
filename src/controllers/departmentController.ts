import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

/**
 * Get all departments with automatic seeding if empty
 */
export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  let [departments] = await pool.query('SELECT * FROM departments');
  let deptRows = departments as any[];

  // Parse JSON areas for frontend
  const parsedDepts = deptRows.map(row => ({
    ...row,
    areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas
  }));

  res.json(ApiResponse.success(formatDataUrls(parsedDepts, []), 'Departments fetched successfully'));
});

/**
 * Update a specific department's details
 */
export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const name = sanitizeString(req.body.name);
  const shortName = sanitizeString(req.body.shortName);
  const overview = sanitizeString(req.body.overview);
  const faculty = req.body.faculty;
  const clinicalHours = sanitizeString(req.body.clinicalHours);
  let { areas } = req.body;

  if (Array.isArray(areas)) {
    areas = JSON.stringify(areas.map(a => sanitizeString(a)));
  } else if (typeof areas === 'string') {
    areas = sanitizeString(areas);
  }

  const [result] = await pool.query(
    'UPDATE departments SET name = ?, shortName = ?, overview = ?, areas = ?, faculty = ?, clinicalHours = ? WHERE id = ?',
    [name, shortName, overview, areas, faculty, clinicalHours, id]
  );

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Department not found');
  }

  const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
  const updatedRow = (updated as any[])[0];

  const response = {
    ...updatedRow,
    areas: typeof updatedRow.areas === 'string' ? JSON.parse(updatedRow.areas) : updatedRow.areas
  };

  res.json(ApiResponse.success(formatDataUrls(response, []), 'Department updated successfully'));
});
