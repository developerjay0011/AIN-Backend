import pool from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Request, Response, NextFunction } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  // Total Counts for Primary Modules
  const [noticesCount] = await pool.query('SELECT COUNT(*) as count FROM notices');
  const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM staff');
  const [achievementsCount] = await pool.query('SELECT COUNT(*) as count FROM achievements');
  
  // Aggregated Media Count (Images, Videos, and Documents)
  // We count unique non-null file reference fields across all relevant tables
  const mediaTables = [
      { table: 'gallery_media', column: 'url' },
      { table: 'staff', column: 'image' },
      { table: 'hero_slides', column: 'imageUrl' },
      { table: 'toppers', column: 'imageUrl' },
      { table: 'alumni_milestones', column: 'imageUrl' },
      { table: 'notices', column: 'imageUrl' },
      { table: 'notice_links', column: 'url' },
      { table: 'aqars', column: 'documentUrl' }
  ];

  let totalMediaCount = 0;
  let weeklyMediaTrend = 0;

  for (const item of mediaTables) {
      const [total] = await pool.query(`SELECT COUNT(*) as count FROM ${item.table} WHERE ${item.column} IS NOT NULL AND ${item.column} != ''`);
      totalMediaCount += (total as any)[0].count;

      const [trend] = await pool.query(`SELECT COUNT(*) as count FROM ${item.table} WHERE createdAt >= NOW() - INTERVAL 7 DAY AND ${item.column} IS NOT NULL AND ${item.column} != ''`);
      weeklyMediaTrend += (trend as any)[0].count;
  }

  // Trends (Last 7 Days) for other modules
  const [newNotices] = await pool.query("SELECT COUNT(*) as count FROM notices WHERE createdAt >= NOW() - INTERVAL 7 DAY");
  const [newStaff] = await pool.query("SELECT COUNT(*) as count FROM staff WHERE createdAt >= NOW() - INTERVAL 7 DAY");
  const [newAchievements] = await pool.query("SELECT COUNT(*) as count FROM achievements WHERE createdAt >= NOW() - INTERVAL 7 DAY");

  res.json(ApiResponse.success({
    notices: (noticesCount as any)[0].count,
    staff: (staffCount as any)[0].count,
    achievements: (achievementsCount as any)[0].count,
    mediaAssets: totalMediaCount,
    trends: {
      notices: (newNotices as any)[0].count,
      staff: (newStaff as any)[0].count,
      achievements: (newAchievements as any)[0].count,
      media: weeklyMediaTrend
    }
  }, 'Dashboard stats with trends fetched successfully'));
});

export default { getDashboardStats };
