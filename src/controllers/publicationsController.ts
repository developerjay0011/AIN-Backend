import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { getUploadPath, formatDataUrls } from '../utils/urlHelper.js';

/**
 * Helper to resolve uploaded file paths and existing file URLs into a single string or JSON array
 */
const resolveFileUrls = (files: Express.Multer.File[] | undefined, bodyFileUrl: any, existingFileUrl?: any) => {
  const uploadedUrls: string[] = [];
  
  if (files && files.length > 0) {
    files.forEach(file => {
      if (file.fieldname !== 'img') {
        const p = getUploadPath(file);
        if (p) uploadedUrls.push(p);
      }
    });
  }

  let bodyUrls: string[] = [];
  if (bodyFileUrl) {
    if (typeof bodyFileUrl === 'string') {
      try {
        const parsed = JSON.parse(bodyFileUrl);
        if (Array.isArray(parsed)) {
          bodyUrls = parsed.map((item: any) => typeof item === 'string' ? item : item.url || item.path || '');
        } else {
          bodyUrls = [bodyFileUrl];
        }
      } catch {
        bodyUrls = [bodyFileUrl];
      }
    } else if (Array.isArray(bodyFileUrl)) {
      bodyUrls = bodyFileUrl.map((item: any) => typeof item === 'string' ? item : item.url || item.path || '');
    }
  }

  const allUrls = [...new Set([...bodyUrls, ...uploadedUrls])].filter(Boolean);

  if (allUrls.length === 0) {
    return existingFileUrl || null;
  }
  return allUrls.length === 1 ? allUrls[0] : JSON.stringify(allUrls);
};

// Get all publications
export const getPublications = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM publications ORDER BY id DESC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['img', 'fileUrl']), 'Publications fetched successfully'));
});

// Create publication
export const createPublication = asyncHandler(async (req: Request, res: Response) => {
  const {
    type, title, author, initials, department, date, venue, speaker, topic, description, papers
  } = req.body;

  if (!type || !title) {
    throw new ApiError(400, 'Type and Title are required');
  }

  // Handle uploaded image file
  const files = req.files as Express.Multer.File[] | undefined;
  let resolvedImg: string | null = req.body.img || null;
  if (files) {
    const imgFile = files.find(f => f.fieldname === 'img');
    if (imgFile) {
      resolvedImg = getUploadPath(imgFile);
    }
  }

  const resolvedFileUrl = resolveFileUrls(files, req.body.fileUrl || req.body.existingFileUrls);

  let papersValue = papers;
  if (typeof papers === 'string') {
    try {
      papersValue = JSON.parse(papers);
    } catch (e) {
      papersValue = papers;
    }
  }
  const papersSerialized = Array.isArray(papersValue) ? JSON.stringify(papersValue) : papersValue;

  const [result] = await pool.query(
    `INSERT INTO publications (
      type, title, author, initials, department, date, venue, speaker, topic, description, img, fileUrl, papers
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sanitizeString(type),
      sanitizeString(title),
      author ? sanitizeString(author) : null,
      initials ? sanitizeString(initials) : null,
      department ? sanitizeString(department) : null,
      date ? sanitizeString(date) : null,
      venue ? sanitizeString(venue) : null,
      speaker ? sanitizeString(speaker) : null,
      topic ? sanitizeString(topic) : null,
      description ? sanitizeString(description) : null,
      resolvedImg ? sanitizeString(resolvedImg) : null,
      resolvedFileUrl ? sanitizeString(resolvedFileUrl) : null,
      papersSerialized ? sanitizeString(papersSerialized) : null
    ]
  );

  res.json(ApiResponse.success({ id: (result as any).insertId }, 'Publication created successfully'));
});

// Update publication
export const updatePublication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    type, title, author, initials, department, date, venue, speaker, topic, description, img, papers
  } = req.body;

  if (!type || !title) {
    throw new ApiError(400, 'Type and Title are required');
  }

  const files = req.files as Express.Multer.File[] | undefined;
  const [existingRows] = await pool.query('SELECT img, fileUrl FROM publications WHERE id = ?', [id]);
  const existing = (existingRows as any[])[0];

  let resolvedImg: string | null = img || (existing ? existing.img : null);
  if (files) {
    const imgFile = files.find(f => f.fieldname === 'img');
    if (imgFile) {
      resolvedImg = getUploadPath(imgFile);
    }
  }

  const resolvedFileUrl = resolveFileUrls(files, req.body.fileUrl || req.body.existingFileUrls, existing?.fileUrl);

  let papersValue = papers;
  if (typeof papers === 'string') {
    try {
      papersValue = JSON.parse(papers);
    } catch (e) {
      papersValue = papers;
    }
  }
  const papersSerialized = Array.isArray(papersValue) ? JSON.stringify(papersValue) : papersValue;

  await pool.query(
    `UPDATE publications SET
      type = ?, title = ?, author = ?, initials = ?, department = ?, date = ?, venue = ?, speaker = ?, topic = ?, description = ?, img = ?, fileUrl = ?, papers = ?
    WHERE id = ?`,
    [
      sanitizeString(type),
      sanitizeString(title),
      author ? sanitizeString(author) : null,
      initials ? sanitizeString(initials) : null,
      department ? sanitizeString(department) : null,
      date ? sanitizeString(date) : null,
      venue ? sanitizeString(venue) : null,
      speaker ? sanitizeString(speaker) : null,
      topic ? sanitizeString(topic) : null,
      description ? sanitizeString(description) : null,
      resolvedImg ? sanitizeString(resolvedImg) : null,
      resolvedFileUrl ? sanitizeString(resolvedFileUrl) : null,
      papersSerialized ? sanitizeString(papersSerialized) : null,
      id
    ]
  );

  res.json(ApiResponse.success(null, 'Publication updated successfully'));
});

// Delete publication
export const deletePublication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM publications WHERE id = ?', [id]);
  res.json(ApiResponse.success(null, 'Publication deleted successfully'));
});
