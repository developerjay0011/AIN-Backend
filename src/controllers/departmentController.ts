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

  // Parse JSON areas and facilities for frontend, and dynamically resolve teaching faculty
  const parsedDepts = [];
  for (const row of deptRows) {
    const [staffMembers]: any = await pool.query(
      `SELECT * FROM staff 
       WHERE department = ? OR department = ? OR department LIKE ? OR department LIKE ?`,
      [row.id, row.name, `%${row.shortName}%`, `%${row.name}%`]
    );

    const formattedStaff = formatDataUrls(staffMembers, ['image']);

    parsedDepts.push({
      ...row,
      areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas,
      facilities: typeof row.facilities === 'string' ? JSON.parse(row.facilities) : (row.facilities || []),
      faculty: staffMembers.length,
      facultyMembers: formattedStaff
    });
  }

  res.json(ApiResponse.success(parsedDepts, 'Departments fetched successfully'));
});

/**
 * Update a specific department's details
 */
export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const name = sanitizeString(req.body.name);
  const shortName = sanitizeString(req.body.shortName);
  const overview = sanitizeString(req.body.overview);
  const clinicalHours = sanitizeString(req.body.clinicalHours);
  const hod = sanitizeString(req.body.hod);
  const icon = req.body.icon ? sanitizeString(req.body.icon) : null;
  const color = req.body.color ? sanitizeString(req.body.color) : null;
  const iconBg = req.body.iconBg ? sanitizeString(req.body.iconBg) : null;
  const iconColor = req.body.iconColor ? sanitizeString(req.body.iconColor) : null;
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
    'UPDATE departments SET name = ?, shortName = ?, overview = ?, areas = ?, clinicalHours = ?, hod = ?, facilities = ?, icon = ?, color = ?, iconBg = ?, iconColor = ? WHERE id = ?',
    [name, shortName, overview, areas, clinicalHours, hod, facilities, icon, color, iconBg, iconColor, id]
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

  res.json(ApiResponse.success(response, 'Department updated successfully'));
});

/**
 * Create a new department
 */
export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  const name = sanitizeString(req.body.name);
  const shortName = sanitizeString(req.body.shortName);
  const overview = sanitizeString(req.body.overview);
  const clinicalHours = sanitizeString(req.body.clinicalHours);
  const hod = sanitizeString(req.body.hod);
  const icon = req.body.icon ? sanitizeString(req.body.icon) : null;
  const color = req.body.color ? sanitizeString(req.body.color) : null;
  const iconBg = req.body.iconBg ? sanitizeString(req.body.iconBg) : null;
  const iconColor = req.body.iconColor ? sanitizeString(req.body.iconColor) : null;
  let { areas, facilities } = req.body;

  if (Array.isArray(areas)) {
    areas = JSON.stringify(areas.map(a => sanitizeString(a)));
  } else if (typeof areas === 'string') {
    areas = sanitizeString(areas);
  } else {
    areas = JSON.stringify([]);
  }

  if (Array.isArray(facilities)) {
    facilities = JSON.stringify(facilities.map(f => sanitizeString(f)));
  } else if (typeof facilities === 'string') {
    facilities = sanitizeString(facilities);
  } else {
    facilities = JSON.stringify([]);
  }

  // Generate ID based on shortName slug
  const slug = shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const id = `depart_${slug || Date.now()}`;

  await pool.query(
    'INSERT INTO departments (id, name, shortName, overview, areas, clinicalHours, hod, facilities, icon, color, iconBg, iconColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, shortName, overview, areas, clinicalHours, hod, facilities, icon, color, iconBg, iconColor]
  );

  const [inserted] = await pool.query('SELECT * FROM departments WHERE id = ?', [id]);
  const row = (inserted as any[])[0];

  const response = {
    ...row,
    areas: typeof row.areas === 'string' ? JSON.parse(row.areas) : row.areas,
    facilities: typeof row.facilities === 'string' ? JSON.parse(row.facilities) : (row.facilities || []),
    facultyMembers: []
  };

  res.status(201).json(ApiResponse.success(response, 'Department created successfully'));
});

