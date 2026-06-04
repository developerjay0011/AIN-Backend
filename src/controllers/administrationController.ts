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
  const mappedRows = rows.map((r: any) => ({
    ...r,
    role: r.designation || r.role
  }));
  res.json(ApiResponse.success(formatDataUrls(mappedRows, ['imageUrl']), 'Administration members fetched successfully'));
});

/**
 * Create or Update Administration Member
 * Supports optional staffId linkage: when staffId is provided on create,
 * missing detail fields are resolved from the staff table.
 */
export const handleAdministrationMemberPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, name, role, designation, qualification, experience, specialization, quote, description, staffId } = sanitizeObject(req.body);
  const uploadedImage = req.file ? getUploadPath(req.file) : null;
  const passedImageUrl = req.body.imageUrl || null;
  const resolvedDesignation = designation || role || null;

  if (id === '0' || !id || id === 'null' || id === 0) {
    // ── CREATE ─────────────────────────────────────────────────────────────
    // If a staffId was provided, resolve missing fields from the staff table
    let resolvedImageUrl = uploadedImage || passedImageUrl || null;

    if (staffId) {
      const [staffRows]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [staffId]);
      if (staffRows.length > 0) {
        const staff = staffRows[0];
        // Only fill a field if the caller left it blank
        name          = name          || staff.name          || null;
        designation   = designation   || staff.designation   || null;
        qualification = qualification || staff.qualification || null;
        experience    = experience    || staff.experience    || null;
        specialization = specialization || staff.specialization || null;
        
        // Use staff image only if no image was explicitly uploaded
        if (!resolvedImageUrl && staff.image) {
          resolvedImageUrl = staff.image;
        }
      }
    }

    const finalDesignation = designation || resolvedDesignation;

    if (!name || !finalDesignation) {
      throw new ApiError(400, 'Name and Designation are required');
    }

    const newId = `ADMIN-${Date.now()}`;
    const [countRows]: any = await pool.query('SELECT COUNT(*) as count FROM administration_members');
    const sortOrder = countRows[0].count;

    await pool.query(
      `INSERT INTO administration_members
         (id, name, designation, imageUrl, qualification, experience, specialization, quote, description, sortOrder, isLinked, staffId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        name,
        finalDesignation,
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
    const responseData = { ...newMem[0], role: newMem[0].designation || newMem[0].role };
    return res.status(201).json(ApiResponse.success(formatDataUrls(responseData, ['imageUrl']), 'Administration member created successfully'));

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
           imageUrl       = COALESCE(?, imageUrl), 
           qualification  = COALESCE(?, qualification), 
           experience     = COALESCE(?, experience), 
           specialization = COALESCE(?, specialization), 
           quote          = COALESCE(?, quote), 
           description    = COALESCE(?, description),
           staffId        = ?,
           updatedAt      = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, resolvedDesignation, imageUrl, qualification, experience, specialization, quote, description, staffId || null, id]
    );

    // For linked members (director/principal/registrar): mirror key fields to the linked staff row.
    // administration_members is now the single source of truth — staff stays in sync.
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
    const responseData = { ...updatedMem[0], role: updatedMem[0].designation || updatedMem[0].role };
    return res.json(ApiResponse.success(formatDataUrls(responseData, ['imageUrl']), 'Administration member updated successfully'));
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
  const { orders } = req.body; // Array of { id, sortOrder }
  if (!Array.isArray(orders)) {
    throw new ApiError(400, 'Invalid sorting order payload');
  }

  for (const item of orders) {
    await pool.query('UPDATE administration_members SET sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [item.sortOrder, item.id]);
  }

  res.json(ApiResponse.success(null, 'Administration sorting updated successfully'));
});

export default { getAdministrationMembers, handleAdministrationMemberPost, deleteAdministrationMember, updateAdministrationSorting };
