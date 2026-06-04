import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls } from '../utils/urlHelper.js';

// Default seeded nodes that cannot be deleted to preserve organogram structure
const PROTECTED_NODES = [
  'awes',
  'director-node',
  'registrar-node',
  'principal-node',
  'vice-principal-node',
  'academic-wing-node',
  'clinical-wing-node',
  'admin-wing-node',
  'support-wing-node'
];

/**
 * Get all Organogram Nodes
 */
export const getOrganogramNodes = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query(`
    SELECT 
      onode.*,
      am.name as memberName,
      am.designation as memberRole,
      am.designation as memberDesignation,
      am.imageUrl as memberImageUrl,
      am.qualification as memberQualification,
      am.experience as memberExperience,
      am.specialization as memberSpecialization,
      am.quote as memberQuote,
      am.description as memberDescription
    FROM organogram_nodes onode
    LEFT JOIN administration_members am ON onode.memberId = am.id
    ORDER BY onode.level ASC, onode.sortOrder ASC
  `);
  
  res.json(ApiResponse.success(formatDataUrls(rows, ['memberImageUrl']), 'Organogram nodes fetched successfully'));
});

/**
 * Create or Update Organogram Node
 */
export const handleOrganogramNodePost = asyncHandler(async (req: Request, res: Response) => {
  let { id, title, level, parentId, memberId, customName, customSubtitle, sortOrder } = sanitizeObject(req.body);

  if (!title || !level) {
    throw new ApiError(400, 'Title and Level are required');
  }

  // Handle nullable parent and member references
  const resolvedParentId = parentId && parentId !== 'null' ? parentId : null;
  const resolvedMemberId = memberId && memberId !== 'null' ? memberId : null;

  if (id === '0' || !id || id === 'null' || id === 0) {
    const newId = `NODE-${Date.now()}`;
    const [countRows]: any = await pool.query('SELECT COUNT(*) as count FROM organogram_nodes WHERE level = ?', [level]);
    const resolvedSortOrder = sortOrder !== undefined ? sortOrder : countRows[0].count;

    await pool.query(
      `INSERT INTO organogram_nodes (id, title, level, parentId, memberId, customName, customSubtitle, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, title, level, resolvedParentId, resolvedMemberId, customName || null, customSubtitle || null, resolvedSortOrder]
    );

    const [newNode] = await pool.query('SELECT * FROM organogram_nodes WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success((newNode as any)[0], 'Organogram node created successfully'));
  } else {
    // Check if node exists
    const [existing]: any = await pool.query('SELECT * FROM organogram_nodes WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Organogram node not found');
    }

    // Update table details
    await pool.query(
      `UPDATE organogram_nodes 
       SET title = ?, 
           level = ?, 
           parentId = ?, 
           memberId = ?, 
           customName = ?, 
           customSubtitle = ?, 
           sortOrder = COALESCE(?, sortOrder),
           updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, level, resolvedParentId, resolvedMemberId, customName || null, customSubtitle || null, sortOrder, id]
    );

    const [updatedNode] = await pool.query('SELECT * FROM organogram_nodes WHERE id = ?', [id]);
    return res.json(ApiResponse.success((updatedNode as any)[0], 'Organogram node updated successfully'));
  }
});

/**
 * Delete Organogram Node
 */
export const deleteOrganogramNode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const idStr = id as string;

  if (PROTECTED_NODES.includes(idStr)) {
    throw new ApiError(400, 'Default hierarchical structure nodes cannot be deleted to prevent broken connections.');
  }

  const [existing]: any = await pool.query('SELECT * FROM organogram_nodes WHERE id = ?', [idStr]);
  if (existing.length === 0) {
    throw new ApiError(404, 'Organogram node not found');
  }

  await pool.query('DELETE FROM organogram_nodes WHERE id = ?', [id]);
  res.json(ApiResponse.success(null, 'Organogram node deleted successfully'));
});

/**
 * Update Organogram Sorting & Parent configuration
 */
export const updateOrganogramSorting = asyncHandler(async (req: Request, res: Response) => {
  const { orders } = req.body; // Array of { id, parentId, sortOrder }
  if (!Array.isArray(orders)) {
    throw new ApiError(400, 'Invalid sorting order payload');
  }

  for (const item of orders) {
    const resolvedParentId = item.parentId && item.parentId !== 'null' ? item.parentId : null;
    await pool.query(
      'UPDATE organogram_nodes SET parentId = ?, sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', 
      [resolvedParentId, item.sortOrder, item.id]
    );
  }

  res.json(ApiResponse.success(null, 'Organogram structure and order updated successfully'));
});
