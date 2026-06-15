import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

/**
 * Get all Administration Members
 */
export const getAdministrationMembers = asyncHandler(async (req: Request, res: Response) => {
  const [rows]: any = await pool.query('SELECT * FROM administration_members ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Administration members fetched successfully'));
});

/**
 * Create or Update Administration Member
 * role      = preset category (e.g. "Associate Professor") — used for staff grouping
 * designation = free-text title (e.g. "M.Sc Nursing, AIN Guwahati")
 */
export const handleAdministrationMemberPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, name, role, designation, qualification, experience, specialization, quote, description, staffId, section } = sanitizeObject(req.body);
  const uploadedImage = req.file ? getUploadPath(req.file) : null;
  const passedImageUrl = req.body.imageUrl || null;

  const VALID_SECTIONS = ['director', 'principal', 'registrar', 'academic-staff', 'admin-staff'];
  const resolvedSection = VALID_SECTIONS.includes(section) ? section : 'academic-staff';

  if (id === '0' || !id || id === 'null' || id === 0) {
    // ── CREATE ─────────────────────────────────────────────────────────────
    // Enforce single-member constraint for core sections
    const CORE_SECTIONS = ['director', 'principal', 'registrar'];
    if (CORE_SECTIONS.includes(resolvedSection)) {
      const [existing]: any = await pool.query(
        'SELECT id FROM administration_members WHERE section = ? LIMIT 1',
        [resolvedSection]
      );
      if (existing.length > 0) {
        throw new ApiError(409, `A ${resolvedSection} profile already exists. Only one profile is allowed per core section. Please edit the existing profile instead.`);
      }
    }

    // If a staffId was provided, resolve missing fields from the staff table
    let resolvedImageUrl = uploadedImage || passedImageUrl || null;

    if (staffId) {
      const [staffRows]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [staffId]);
      if (staffRows.length > 0) {
        const staff = staffRows[0];
        name          = name          || staff.name          || null;
        designation   = designation   || staff.designation   || null;
        qualification = qualification || staff.qualification || null;
        experience    = experience    || staff.experience    || null;
        specialization = specialization || staff.specialization || null;
        if (!resolvedImageUrl && staff.image) {
          resolvedImageUrl = staff.image;
        }
      }
    }

    if (!name || !designation) {
      throw new ApiError(400, 'Name and Designation are required');
    }

    const newId = `ADMIN-${Date.now()}`;
    const [countRows]: any = await pool.query('SELECT COUNT(*) as count FROM administration_members');
    const sortOrder = countRows[0].count;

    await pool.query(
      `INSERT INTO administration_members
         (id, name, designation, section, role, imageUrl, qualification, experience, specialization, quote, description, sortOrder, isLinked, staffId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        name,
        designation,
        resolvedSection,
        role         || null,
        resolvedImageUrl,
        qualification  || '',
        experience     || '',
        specialization || '',
        quote          || '',
        description    || '',
        sortOrder,
        staffId ? 1 : 0,
        staffId        || null,
      ]
    );

    const [newMem]: any = await pool.query('SELECT * FROM administration_members WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls(newMem[0], ['imageUrl']), 'Administration member created successfully'));

  } else {
    // ── UPDATE ─────────────────────────────────────────────────────────────
    const [existing]: any = await pool.query('SELECT * FROM administration_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Administration member not found');
    }

    const isLinked = existing[0].isLinked === 1 || existing[0].isLinked === true;
    const imageUrl = uploadedImage || passedImageUrl || null;

    await pool.query(
      `UPDATE administration_members 
       SET name           = COALESCE(?, name), 
           designation    = COALESCE(?, designation),
           section        = COALESCE(?, section),
           role           = COALESCE(?, role),
           imageUrl       = COALESCE(?, imageUrl), 
           qualification  = COALESCE(?, qualification), 
           experience     = COALESCE(?, experience), 
           specialization = COALESCE(?, specialization), 
           quote          = COALESCE(?, quote), 
           description    = COALESCE(?, description),
           staffId        = ?,
           updatedAt      = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, designation, resolvedSection, role || null, imageUrl, qualification, experience, specialization, quote, description, staffId || null, id]
    );

    // For linked members: mirror key fields to the linked staff row.
    if (isLinked) {
      const [updatedAdmin]: any = await pool.query(
        'SELECT staffId, name, imageUrl, qualification, experience, specialization, designation FROM administration_members WHERE id = ?',
        [id]
      );
      if (updatedAdmin.length > 0 && updatedAdmin[0].staffId) {
        const a = updatedAdmin[0];
        await pool.query(
          `UPDATE staff
           SET name           = COALESCE(?, name),
               image          = COALESCE(?, image),
               qualification  = COALESCE(?, qualification),
               experience     = COALESCE(?, experience),
               specialization = COALESCE(?, specialization),
               designation    = COALESCE(?, designation),
               updatedAt      = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [a.name || null, a.imageUrl || null, a.qualification || null, a.experience || null, a.specialization || null, a.designation || null, a.staffId]
        );
      }
    }

    const [updatedMem]: any = await pool.query('SELECT * FROM administration_members WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls(updatedMem[0], ['imageUrl']), 'Administration member updated successfully'));
  }
});

/**
 * Delete Administration Member
 */
export const deleteAdministrationMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [existing]: any = await pool.query('SELECT * FROM administration_members WHERE id = ?', [id]);
  if (existing.length === 0) {
    throw new ApiError(404, 'Administration member not found');
  }

  const coreIds = ['director', 'principal', 'registrar'];
  if (coreIds.includes(existing[0].id)) {
    throw new ApiError(400, 'Core leadership profiles (Director, Principal, Registrar) cannot be deleted');
  }

  await pool.query('DELETE FROM administration_members WHERE id = ?', [id]);
  res.json(ApiResponse.success(null, 'Administration member deleted successfully'));
});

/**
 * Update sorting order
 */
export const updateAdministrationSorting = asyncHandler(async (req: Request, res: Response) => {
  const { orders } = req.body;
  if (!Array.isArray(orders)) {
    throw new ApiError(400, 'Invalid sorting order payload');
  }

  for (const item of orders) {
    await pool.query('UPDATE administration_members SET sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [item.sortOrder, item.id]);
  }

  res.json(ApiResponse.success(null, 'Administration sorting updated successfully'));
});

export default { getAdministrationMembers, handleAdministrationMemberPost, deleteAdministrationMember, updateAdministrationSorting };
