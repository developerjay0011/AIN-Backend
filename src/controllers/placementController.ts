import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

/**
 * Get all Placement Cell Members
 */
export const getPlacementMembers = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM placement_members ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Placement members fetched successfully'));
});

/**
 * Create or Update Placement Cell Member
 */
export const handlePlacementMemberPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, name, designation, role, email } = sanitizeObject(req.body);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0) {
    if (!name || !role) {
      throw new ApiError(400, 'Name and Role are required');
    }
    const newId = `PM-${Date.now()}`;
    // Get next sortOrder
    const [countRows]: any = await pool.query('SELECT COUNT(*) as count FROM placement_members');
    const sortOrder = countRows[0].count;

    await pool.query(
      'INSERT INTO placement_members (id, name, designation, role, email, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newId, name, designation || '', role, email || null, imageUrl, sortOrder]
    );
    const [newMem] = await pool.query('SELECT * FROM placement_members WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newMem as any)[0], ['imageUrl']), 'Placement member created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM placement_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Placement member not found');
    }
    await pool.query(
      'UPDATE placement_members SET name = COALESCE(?, name), designation = COALESCE(?, designation), role = COALESCE(?, role), email = COALESCE(?, email), imageUrl = COALESCE(?, imageUrl), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, designation, role, email, imageUrl, id]
    );
    const [updatedMem] = await pool.query('SELECT * FROM placement_members WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedMem as any)[0], ['imageUrl']), 'Placement member updated successfully'));
  }
});

/**
 * Delete Placement Cell Member
 */
export const deletePlacementMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM placement_members WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Placement member not found');
  }
  res.json(ApiResponse.success(null, 'Placement member deleted successfully'));
});

/**
 * Get all Placement Stats
 */
export const getPlacementStats = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM placement_stats ORDER BY year DESC');
  res.json(ApiResponse.success(rows, 'Placement statistics fetched successfully'));
});

/**
 * Create or Update Placement Stat
 */
export const handlePlacementStatPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, year, hospitalsCount, eligibleStudents, placedStudents } = sanitizeObject(req.body);

  const hospitals = parseInt(hospitalsCount) || 0;
  const eligible = parseInt(eligibleStudents) || 0;
  const placed = parseInt(placedStudents) || 0;

  // Auto calculate percentage
  let pct = 0;
  if (eligible > 0) {
    pct = (placed / eligible) * 100;
  }
  if (pct > 100) pct = 100;
  if (pct < 0) pct = 0;
  const percentage = pct.toFixed(2);

  if (id === '0' || !id || id === 0) {
    if (!year) {
      throw new ApiError(400, 'Academic Year is required');
    }
    const newId = `PS-${Date.now()}`;
    await pool.query(
      'INSERT INTO placement_stats (id, year, hospitalsCount, eligibleStudents, placedStudents, placementPercentage) VALUES (?, ?, ?, ?, ?, ?)',
      [newId, year, hospitals, eligible, placed, percentage]
    );
    const [newStat] = await pool.query('SELECT * FROM placement_stats WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success((newStat as any)[0], 'Placement statistic created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM placement_stats WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Placement statistic not found');
    }
    await pool.query(
      'UPDATE placement_stats SET year = COALESCE(?, year), hospitalsCount = COALESCE(?, hospitalsCount), eligibleStudents = COALESCE(?, eligibleStudents), placedStudents = COALESCE(?, placedStudents), placementPercentage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [year, hospitals, eligible, placed, percentage, id]
    );
    const [updatedStat] = await pool.query('SELECT * FROM placement_stats WHERE id = ?', [id]);
    return res.json(ApiResponse.success((updatedStat as any)[0], 'Placement statistic updated successfully'));
  }
});

/**
 * Delete Placement Stat
 */
export const deletePlacementStat = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM placement_stats WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Placement statistic not found');
  }
  res.json(ApiResponse.success(null, 'Placement statistic deleted successfully'));
});

/**
 * Get all Placement Highlights
 */
export const getPlacementHighlights = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM placement_highlights ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(rows, 'Placement highlights fetched successfully'));
});

/**
 * Create or Update Placement Highlight
 */
export const handlePlacementHighlightPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, type, text } = sanitizeObject(req.body);

  if (id === '0' || !id || id === 0) {
    if (!text) {
      throw new ApiError(400, 'Highlight text is required');
    }
    const newId = `PH-${Date.now()}`;
    const [countRows]: any = await pool.query('SELECT COUNT(*) as count FROM placement_highlights');
    const sortOrder = countRows[0].count;

    await pool.query(
      'INSERT INTO placement_highlights (id, type, text, sortOrder) VALUES (?, ?, ?, ?)',
      [newId, type || 'general', text, sortOrder]
    );
    const [newHl] = await pool.query('SELECT * FROM placement_highlights WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success((newHl as any)[0], 'Placement highlight created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM placement_highlights WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Placement highlight not found');
    }
    await pool.query(
      'UPDATE placement_highlights SET type = COALESCE(?, type), text = COALESCE(?, text), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [type, text, id]
    );
    const [updatedHl] = await pool.query('SELECT * FROM placement_highlights WHERE id = ?', [id]);
    return res.json(ApiResponse.success((updatedHl as any)[0], 'Placement highlight updated successfully'));
  }
});

/**
 * Delete Placement Highlight
 */
export const deletePlacementHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM placement_highlights WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Placement highlight not found');
  }
  res.json(ApiResponse.success(null, 'Placement highlight deleted successfully'));
});
