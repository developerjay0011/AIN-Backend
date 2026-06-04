import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

/**
 * Staff IDs that are linked to core leadership profiles in administration_members.
 * These rows cannot be deleted; edits sync back to administration_members.
 */
const PROTECTED_STAFF_IDS: Record<string, string> = {
  'STF-1775881000101': 'director',  // Brig Ajit Kumar Borah
  'STF-1775881000001': 'principal', // Prof. Kabita Baishya
  'STF-1775881000102': 'registrar', // Col Jyoti Prasad Saikia
};

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;
  let query = 'SELECT * FROM staff';
  let params: any[] = [];

  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }

  const [rows]: any = await pool.query(query, params);
  const mappedRows = rows.map((r: any) => ({
    ...r,
    role: r.designation || r.role
  }));
  res.json(ApiResponse.success(formatDataUrls(mappedRows, ['image']), 'Staff members fetched successfully'));
});

export const handleStaffPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, role, designation, type, qualification, experience, specialization, department } = sanitizeObject(req.body);
  const image = req.file ? getUploadPath(req.file) : (req.body.image || null);
  const resolvedDesignation = designation || role || null;

  if (id === '0' || !id || id === 0) {
    // ── Create ────────────────────────────────────────────────────────────
    if (!name || !type) {
      throw new ApiError(400, 'Name and Type are required');
    }

    const newId = `STF-${Date.now()}`;
    const query = `
      INSERT INTO staff (id, name, designation, type, image, qualification, experience, specialization, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      department || null
    ]);

    const [newMember]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [newId]);
    const responseData = { ...newMember[0], role: newMember[0].designation || newMember[0].role };
    return res.status(201).json(ApiResponse.success(formatDataUrls(responseData, ['image']), 'Staff member created successfully'));

  } else {
    // ── Update ────────────────────────────────────────────────────────────
    const [existing]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Staff member not found');
    }

    const query = `
      UPDATE staff 
      SET name           = COALESCE(?, name),
          designation    = COALESCE(?, designation),
          type           = COALESCE(?, type),
          qualification  = COALESCE(?, qualification),
          experience     = COALESCE(?, experience),
          specialization = COALESCE(?, specialization),
          department     = COALESCE(?, department),
          image          = COALESCE(?, image),
          updatedAt      = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [
      name || null,
      resolvedDesignation,
      type || null,
      qualification || null,
      experience || null,
      specialization || null,
      department || null,
      image,
      id
    ]);

    // If this staff member is linked to a core leadership profile, mirror the update
    // to administration_members so that single-source-of-truth is maintained.
    const adminId = PROTECTED_STAFF_IDS[id];
    if (adminId) {
      await pool.query(
        `UPDATE administration_members
         SET name           = COALESCE(?, name),
             imageUrl       = COALESCE(?, imageUrl),
             qualification  = COALESCE(?, qualification),
             experience     = COALESCE(?, experience),
             specialization = COALESCE(?, specialization),
             updatedAt      = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name || null, image || null, qualification || null, experience || null, specialization || null, adminId]
      );
    }

    const [updatedMember]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    const responseData = { ...updatedMember[0], role: updatedMember[0].designation || updatedMember[0].role };
    return res.json(ApiResponse.success(formatDataUrls(responseData, ['image']), 'Staff member updated successfully'));
  }
});

export const deleteStaffMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Block deletion of core linked leadership staff
  if (PROTECTED_STAFF_IDS[String(id)]) {
    throw new ApiError(400, 'This staff member is a core institutional profile linked to the Administration and About sections. To manage this record, use the Administration Manager.');
  }

  const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Staff member not found');
  }

  res.json(ApiResponse.success(null, 'Staff member deleted successfully'));
});
