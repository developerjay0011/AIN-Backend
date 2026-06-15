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

  // Parse JSON areas and facilities for frontend
  const parsedDepts = deptRows.map(row => ({
    ...row,
    areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas,
    facilities: typeof row.facilities === 'string' ? JSON.parse(row.facilities) : (row.facilities || [])
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
  const hod = sanitizeString(req.body.hod);
  let { areas, facilities } = req.body;

  if (Array.isArray(areas)) {
    areas = JSON.stringify(areas.map(a => sanitizeString(a)));
  } else if (typeof areas === 'string') {
    areas = sanitizeString(areas);
  }

  if (Array.isArray(facilities)) {
    facilities = JSON.stringify(facilities.map(f => sanitizeString(f)));
  } else if (typeof facilities === 'string') {
    facilities = sanitizeString(facilities);
  }

  const [result] = await pool.query(
    'UPDATE departments SET name = ?, shortName = ?, overview = ?, areas = ?, faculty = ?, clinicalHours = ?, hod = ?, facilities = ? WHERE id = ?',
    [name, shortName, overview, areas, faculty, clinicalHours, hod, facilities, id]
  );

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Department not found');
  }

  const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
  const updatedRow = (updated as any[])[0];

  const response = {
    ...updatedRow,
    areas: typeof updatedRow.areas === 'string' ? JSON.parse(updatedRow.areas) : updatedRow.areas,
    facilities: typeof updatedRow.facilities === 'string' ? JSON.parse(updatedRow.facilities) : (updatedRow.facilities || [])
  };

  res.json(ApiResponse.success(formatDataUrls(response, []), 'Department updated successfully'));
});
