import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [noticesCount] = await pool.query('SELECT COUNT(*) as count FROM notices');
  const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM staff');
  const [achievementsCount] = await pool.query('SELECT COUNT(*) as count FROM achievements');
  const [galleryCount] = await pool.query('SELECT COUNT(*) as count FROM gallery_events');
  const [mediaCount] = await pool.query('SELECT COUNT(*) as count FROM gallery_media');

  res.json(ApiResponse.success({
    notices: (noticesCount as any)[0].count,
    staff: (staffCount as any)[0].count,
    achievements: (achievementsCount as any)[0].count,
    galleryEvents: (galleryCount as any)[0].count,
    mediaAssets: (mediaCount as any)[0].count
  }, 'Dashboard stats fetched successfully'));
});

export default { getDashboardStats };
