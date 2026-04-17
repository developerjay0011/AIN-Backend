import pool from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Request, Response, NextFunction } from 'express';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Total Counts
  const [noticesCount] = await pool.query('SELECT COUNT(*) as count FROM notices');
  const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM staff');
  const [achievementsCount] = await pool.query('SELECT COUNT(*) as count FROM achievements');
  const [mediaCount] = await pool.query('SELECT COUNT(*) as count FROM gallery_media');

  // Trends (Last 7 Days)
  const [newNotices] = await pool.query("SELECT COUNT(*) as count FROM notices WHERE createdAt >= NOW() - INTERVAL 7 DAY");
  const [newStaff] = await pool.query("SELECT COUNT(*) as count FROM staff WHERE createdAt >= NOW() - INTERVAL 7 DAY");
  const [newAchievements] = await pool.query("SELECT COUNT(*) as count FROM achievements WHERE createdAt >= NOW() - INTERVAL 7 DAY");

  // For media, we check media associated with events created in the last 7 days since media records lack timestamps
  const [newMedia] = await pool.query("SELECT COUNT(*) as count FROM gallery_media gm JOIN gallery_events ge ON gm.eventId = ge.id WHERE ge.createdAt >= NOW() - INTERVAL 7 DAY");

  res.json(ApiResponse.success({
    notices: (noticesCount as any)[0].count,
    staff: (staffCount as any)[0].count,
    achievements: (achievementsCount as any)[0].count,
    mediaAssets: (mediaCount as any)[0].count,
    trends: {
      notices: (newNotices as any)[0].count,
      staff: (newStaff as any)[0].count,
      achievements: (newAchievements as any)[0].count,
      media: (newMedia as any)[0].count
    }
  }, 'Dashboard stats with trends fetched successfully'));
});

export default { getDashboardStats };
