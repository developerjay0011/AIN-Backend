import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;
  let query = `
    SELECT 
      s.*, 
      d.name as departmentName,
      d.shortName as departmentShortName
    FROM staff s
    LEFT JOIN departments d ON s.department = d.id
  `;
  let params: any[] = [];

  if (type) {
    query += ' WHERE s.type = ?';
    params.push(type);
  }

  const [rows]: any = await pool.query(query, params);
  const mappedRows = rows.map((r: any) => ({
    ...r,
    role: r.role || r.designation
  }));
  res.json(ApiResponse.success(formatDataUrls(mappedRows, ['image']), 'Staff members fetched successfully'));
});

export const handleStaffPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, role, designation, type, qualification, experience, specialization, department, section, quote, description } = sanitizeObject(req.body);
  const image = req.file ? getUploadPath(req.file) : (req.body.image || null);
  const resolvedDesignation = designation || role || null;

  // Enforce single-member constraint for core leadership sections
  const CORE_SECTIONS = ['director', 'principal', 'registrar'];
  if (section && CORE_SECTIONS.includes(section)) {
    const [existing]: any = await pool.query(
      'SELECT id FROM staff WHERE section = ? AND id != ? LIMIT 1',
      [section, id || '0']
    );
    if (existing.length > 0) {
      throw new ApiError(409, `A profile with section "${section}" already exists. Only one profile is allowed per core section.`);
    }
  }

  if (id === '0' || !id || id === 0) {
    // ── Create ────────────────────────────────────────────────────────────
    if (!name || !type) {
      throw new ApiError(400, 'Name and Type are required');
    }

    const newId = `STF-${Date.now()}`;
    const query = `
      INSERT INTO staff (id, name, designation, type, image, qualification, experience, specialization, department, section, role, quote, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      newId,
      name || null,
      resolvedDesignation,
      type || null,
      image,
      qualification || null,
      experience || null,
      specialization || null,
      department || null,
      section || null,
      role || null,
      quote || null,
      description || null,
    ]);

    const [newMember]: any = await pool.query(
      `SELECT s.*, d.name as departmentName, d.shortName as departmentShortName
       FROM staff s
       LEFT JOIN departments d ON s.department = d.id
       WHERE s.id = ?`,
      [newId]
    );
    const responseData = { ...newMember[0], role: newMember[0].role || newMember[0].designation };
    return res.status(201).json(ApiResponse.success(formatDataUrls(responseData, ['image']), 'Staff member created successfully'));

  } else {
    // ── Update ────────────────────────────────────────────────────────────
    const [existing]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Staff member not found');
    }

    const existingRecord = existing[0];
    const resolvedName = name !== undefined ? (name || null) : existingRecord.name;
    const resolvedDesignationWithTitle = designation !== undefined 
      ? (designation || role || null) 
      : (role !== undefined ? (role || null) : existingRecord.designation);
    const resolvedType = type !== undefined ? (type || null) : existingRecord.type;
    const resolvedQualification = qualification !== undefined ? (qualification || null) : existingRecord.qualification;
    const resolvedExperience = experience !== undefined ? (experience || null) : existingRecord.experience;
    const resolvedSpecialization = specialization !== undefined ? (specialization || null) : existingRecord.specialization;
    const resolvedDepartment = department !== undefined ? (department || null) : existingRecord.department;
    const resolvedImage = req.file ? getUploadPath(req.file) : (req.body.image !== undefined ? req.body.image : existingRecord.image);
    const resolvedSection = section !== undefined ? (section || null) : existingRecord.section;
    const resolvedRole = role !== undefined ? (role || null) : existingRecord.role;
    const resolvedQuote = quote !== undefined ? (quote || null) : existingRecord.quote;
    const resolvedDescription = description !== undefined ? (description || null) : existingRecord.description;

    const query = `
      UPDATE staff 
      SET name           = ?,
          designation    = ?,
          type           = ?,
          qualification  = ?,
          experience     = ?,
          specialization = ?,
          department     = ?,
          image          = ?,
          section        = ?,
          role           = ?,
          quote          = ?,
          description    = ?,
          updatedAt      = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [
      resolvedName,
      resolvedDesignationWithTitle,
      resolvedType,
      resolvedQualification,
      resolvedExperience,
      resolvedSpecialization,
      resolvedDepartment,
      resolvedImage,
      resolvedSection,
      resolvedRole,
      resolvedQuote,
      resolvedDescription,
      id
    ]);

    const [updatedMember]: any = await pool.query(
      `SELECT s.*, d.name as departmentName, d.shortName as departmentShortName
       FROM staff s
       LEFT JOIN departments d ON s.department = d.id
       WHERE s.id = ?`,
      [id]
    );
    const responseData = { ...updatedMember[0], role: updatedMember[0].role || updatedMember[0].designation };
    return res.json(ApiResponse.success(formatDataUrls(updatedMember[0], ['image']), 'Staff member updated successfully'));
  }
});

export const deleteStaffMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Block deletion of core linked leadership staff
  const [existing]: any = await pool.query('SELECT section FROM staff WHERE id = ?', [id]);
  if (existing.length > 0 && ['director', 'principal', 'registrar'].includes(existing[0].section)) {
    throw new ApiError(400, 'This staff member is a core institutional profile linked to the Administration and About sections. To manage this record, use the Administration Manager.');
  }

  const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Staff member not found');
  }

  res.json(ApiResponse.success(null, 'Staff member deleted successfully'));
});

