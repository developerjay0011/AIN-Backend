import pool from '../config/db.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllAqars = asyncHandler(async (req: Request, res: Response) => {
  const [aqars] = await pool.query('SELECT * FROM aqars ORDER BY date DESC');

  // Also fetch highlights
  const [rows]: any = await pool.query("SELECT title, value FROM quality_metrics");

  const keyMap: Record<string, string> = {
    'Academic Excellence': 'academicExcellence',
    'Compliance Rate': 'complianceRate',
    'Research Growth': 'researchGrowth'
  };

  const highlights: any = {};
  rows.forEach((r: any) => {
    if (keyMap[r.title]) {
      highlights[keyMap[r.title]] = r.value;
    }
  });

  res.json(ApiResponse.success({
    reports: formatDataUrls(aqars),
    highlights
  }, 'AQAR data and highlights fetched successfully'));
});

export const handleAqarPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, year, title, description, status, date } = sanitizeObject(req.body);
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  let documentUrl = '';
  let size = 'N/A';

  // Standardized document handling
  if (files && files['document']) {
    documentUrl = getUploadPath(files['document'][0]) || '';
    const bytes = files['document'][0].size;
    if (bytes >= 1048576) {
      size = (bytes / 1048576).toFixed(1) + ' MB';
    } else {
      size = (bytes / 1024).toFixed(1) + ' KB';
    }
  } else {
    // Falls back to existing URL if provided in body, allowing COALESCE to keep DB value if null
    documentUrl = req.body.documentUrl || null;
    size = req.body.size || null;
  }

  if (!id || id === '0' || id === 0 || id === 'null') {
    if (!year || !title) {
      throw new ApiError(400, 'Year and Title are required');
    }
    const aqarId = `AQR-${Date.now()}`;
    await pool.query(
      'INSERT INTO aqars (id, year, title, description, status, date, documentUrl, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [aqarId, year, title, description, status || 'Pending', date, documentUrl, size]
    );
    const [newAqar] = await pool.query('SELECT * FROM aqars WHERE id = ?', [aqarId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newAqar as any)[0]), 'AQAR report published successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM aqars WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'AQAR report not found');
    }

    const query = `
      UPDATE aqars SET 
        year = COALESCE(?, year), 
        title = COALESCE(?, title), 
        description = COALESCE(?, description), 
        status = COALESCE(?, status), 
        date = COALESCE(?, date),
        documentUrl = COALESCE(?, documentUrl),
        size = COALESCE(?, size),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [
      year || null,
      title || null,
      description || null,
      status || null,
      date || null,
      documentUrl,
      size,
      id
    ]);

    const [updatedAqar] = await pool.query('SELECT * FROM aqars WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedAqar as any)[0]), 'AQAR report updated successfully'));
  }
});

export const deleteAqar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM aqars WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'AQAR report not found');
  }
  res.json(ApiResponse.success(null, 'AQAR report deleted successfully'));
});

// Fixed Institutional Highlights
export const getInstitutionalHighlights = asyncHandler(async (req: Request, res: Response) => {
  const [rows]: any = await pool.query("SELECT * FROM quality_metrics WHERE title IN ('Academic Excellence', 'Compliance Rate', 'Research Growth')");

  const highlights = {
    academicExcellence: rows.find((r: any) => r.title === 'Academic Excellence')?.value || '',
    complianceRate: rows.find((r: any) => r.title === 'Compliance Rate')?.value || '',
    researchGrowth: rows.find((r: any) => r.title === 'Research Growth')?.value || ''
  };

  res.json(ApiResponse.success(highlights, 'Institutional highlights fetched successfully'));
});

export const updateInstitutionalHighlights = asyncHandler(async (req: Request, res: Response) => {
  const { academicExcellence, complianceRate, researchGrowth } = sanitizeObject(req.body);

  const updates = [
    { title: 'Academic Excellence', value: academicExcellence },
    { title: 'Compliance Rate', value: complianceRate },
    { title: 'Research Growth', value: researchGrowth }
  ];

  for (const item of updates) {
    if (item.value !== undefined) {
      await pool.query(
        'UPDATE quality_metrics SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE title = ?',
        [item.value, item.title]
      );
    }
  }

  res.json(ApiResponse.success(req.body, 'Highlights updated successfully'));
});
