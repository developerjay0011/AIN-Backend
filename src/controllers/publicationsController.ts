import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { getUploadPath, formatDataUrls } from '../utils/urlHelper.js';

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

  // Handle uploaded files
  const files = req.files as Express.Multer.File[] | undefined;
  const fileMap: Record<string, string> = {};
  if (files) {
    files.forEach(file => {
      fileMap[file.fieldname] = getUploadPath(file) || '';
    });
  }

  const resolvedImg = fileMap['img'] || req.body.img || null;
  const resolvedFileUrl = fileMap['fileUrl'] || req.body.fileUrl || null;

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
    type, title, author, initials, department, date, venue, speaker, topic, description, img, fileUrl, papers
  } = req.body;

  if (!type || !title) {
    throw new ApiError(400, 'Type and Title are required');
  }

  // Handle uploaded files
  const files = req.files as Express.Multer.File[] | undefined;
  const fileMap: Record<string, string> = {};
  if (files) {
    files.forEach(file => {
      fileMap[file.fieldname] = getUploadPath(file) || '';
    });
  }

  // Fetch existing record to keep current file/image if not uploaded and not in body
  const [existingRows] = await pool.query('SELECT img, fileUrl FROM publications WHERE id = ?', [id]);
  const existing = (existingRows as any[])[0];

  const resolvedImg = fileMap['img'] || img || (existing ? existing.img : null);
  const resolvedFileUrl = fileMap['fileUrl'] || fileUrl || (existing ? existing.fileUrl : null);

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
