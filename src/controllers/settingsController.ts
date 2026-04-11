import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllSettings = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM settings ORDER BY group_name, label');
  
  // Format settings into a key-value object grouped by section if needed, 
  // or just return as a flat list. For complexity, we'll return both.
  const settingsMap: Record<string, any> = {};
  (rows as any[]).forEach(row => {
    let value = row.value;
    if (row.type === 'json') {
      try {
        value = JSON.parse(row.value);
      } catch (e) {
        value = row.value;
      }
    }
    settingsMap[row.key_name] = value;
  });

  res.json(ApiResponse.success({
    list: rows,
    map: settingsMap
  }, 'Settings fetched successfully'));
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const { settings } = req.body; // Expecting { key: value }

  if (!settings || typeof settings !== 'object') {
    throw new ApiError(400, 'Invalid settings data provided');
  }

  const entries = Object.entries(settings);
  
  for (const [key, value] of entries) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await pool.query(
      'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
      [stringValue, key]
    );
  }

  res.json(ApiResponse.success(null, 'Settings updated successfully'));
});

export const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a logo image');
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  res.json(ApiResponse.success({ url: fileUrl }, 'Logo uploaded successfully'));
});
