import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const PROTECTED_ADMIN_USERNAME = 'admin';

/**
 * Get all administrators
 * GET /api/admins
 */
export const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const [admins] = await pool.query(
    'SELECT id, username, createdAt FROM admins WHERE username != ? ORDER BY createdAt DESC', 
    [PROTECTED_ADMIN_USERNAME]
  );
  res.json(ApiResponse.success(admins, 'Administrators retrieved successfully'));
});

/**
 * Create a new administrator
 * POST /api/admins
 */
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  // Check if admin already exists
  const [existing] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
  if ((existing as any[]).length > 0) {
    throw new ApiError(400, 'Administrator with this username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = `ADM-${Date.now()}`;

  await pool.query(
    'INSERT INTO admins (id, username, password) VALUES (?, ?, ?)',
    [id, username, hashedPassword]
  );

  res.status(201).json(ApiResponse.success({ id, username }, 'Administrator created successfully'));
});

/**
 * Update an administrator
 * PUT /api/admins/:id
 */
export const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!username) {
    throw new ApiError(400, 'Username is required');
  }

  // Check if target admin exists
  const [targets] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
  const admin = (targets as any[])[0];

  if (!admin) {
    throw new ApiError(404, 'Administrator not found');
  }

  // Prevent modifying the main admin
  if (admin.username === PROTECTED_ADMIN_USERNAME) {
    throw new ApiError(403, 'The main administrator account cannot be modified');
  }

  // If password provided, hash it
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE admins SET username = ?, password = ? WHERE id = ?',
      [username, hashedPassword, id]
    );
  } else {
    // Only update username
    await pool.query(
      'UPDATE admins SET username = ? WHERE id = ?',
      [username, id]
    );
  }

  res.json(ApiResponse.success({ id, username }, 'Administrator updated successfully'));
});

/**
 * Delete an administrator
 * DELETE /api/admins/:id
 */
export const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [targets] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
  const admin = (targets as any[])[0];

  if (!admin) {
    throw new ApiError(404, 'Administrator not found');
  }

  // Prevent deleting the main admin
  if (admin.username === PROTECTED_ADMIN_USERNAME) {
    throw new ApiError(403, 'The main administrator account cannot be removed');
  }

  // Protect the last admin (safety check)
  const [allAdmins] = await pool.query('SELECT COUNT(*) as count FROM admins');
  if ((allAdmins as any[])[0].count <= 1) {
    throw new ApiError(400, 'Cannot delete the last administrator');
  }

  await pool.query('DELETE FROM admins WHERE id = ?', [id]);

  res.json(ApiResponse.success(null, 'Administrator removed successfully'));
});

export default {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
