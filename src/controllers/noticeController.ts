import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { sanitizeString, sanitizeObject, formatDateToYYYYMMDD } from '../utils/sanitize.js';

const isAdminRequest = (req: Request): boolean => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        jwt.verify(token, jwtSecret);
        return true;
      }
    }
  } catch (e) { }
  return false;
};

export const getAllNotices = asyncHandler(async (req: Request, res: Response) => {
  const [notices] = await pool.query('SELECT * FROM notices ORDER BY createdAt DESC');

  let filteredNotices = notices as any[];
  if (!isAdminRequest(req)) {
    const todayStr = formatDateToYYYYMMDD(new Date())!;
    filteredNotices = filteredNotices.filter(notice => !notice.expiryDate || notice.expiryDate >= todayStr);
  }

  for (let notice of filteredNotices) {
    const [links]: any = await pool.query('SELECT id, label, url, type FROM notice_links WHERE noticeId = ?', [notice.id]);
    notice.attachments = links.filter((l: any) => l.type === 'attachment' || l.type === 'form');
    try {
      notice.externalLinks = notice.externalLinks ? (typeof notice.externalLinks === 'string' ? JSON.parse(notice.externalLinks) : notice.externalLinks) : [];
    } catch (e) {
      notice.externalLinks = [];
    }
  }

  res.json(ApiResponse.success(formatDataUrls(filteredNotices, ['url']), 'Notices fetched successfully'));
});

export const handleNoticePost = asyncHandler(async (req: Request, res: Response) => {
  let { id, title, date, type, description, critical, externalLinks, expiryDate } = sanitizeObject(req.body);
  date = formatDateToYYYYMMDD(date);
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  if (id === '0' || !id || id === 0 || id === 'null') {
    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    const noticeId = `NOT-${Date.now()}`;
    await pool.query(
      'INSERT INTO notices (id, title, date, type, description, critical, expiryDate, externalLinks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        noticeId,
        title,
        date,
        type,
        description,
        critical === 'true' || critical === true,
        expiryDate || '2027-01-01',
        typeof externalLinks === 'string' ? externalLinks : JSON.stringify(externalLinks || [])
      ]
    );

    // Handle multiple uploaded files
    if (files) {
      if (files['document']) {
        for (const file of files['document']) {
          const fileUrl = getUploadPath(file);
          const linkId = `LNK-${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const label = file.originalname || 'Attachment';
          await pool.query('INSERT INTO notice_links (id, noticeId, label, url, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, label, fileUrl, 'attachment']);
        }
      }
      if (files['formFile']) {
        for (const file of files['formFile']) {
          const fileUrl = getUploadPath(file);
          const linkId = `LNK-${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const label = file.originalname || 'Form';
          await pool.query('INSERT INTO notice_links (id, noticeId, label, url, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, label, fileUrl, 'form']);
        }
      }
    }

    const [newNotice] = await pool.query('SELECT * FROM notices WHERE id = ?', [noticeId]);
    const [newLinks]: any = await pool.query('SELECT id, label, url, type FROM notice_links WHERE noticeId = ?', [noticeId]);
    const noticeObj = (newNotice as any)[0];
    noticeObj.attachments = newLinks.filter((l: any) => l.type === 'attachment' || l.type === 'form');
    try {
      noticeObj.externalLinks = noticeObj.externalLinks ? (typeof noticeObj.externalLinks === 'string' ? JSON.parse(noticeObj.externalLinks) : noticeObj.externalLinks) : [];
    } catch (e) {
      noticeObj.externalLinks = [];
    }
    return res.status(201).json(ApiResponse.success(formatDataUrls(noticeObj, ['imageUrl', 'url']), 'Notice published successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Notice not found');
    }

    await pool.query(
      `UPDATE notices SET 
        title = COALESCE(?, title), 
        date = COALESCE(?, date), 
        type = COALESCE(?, type), 
        description = COALESCE(?, description), 
        critical = ?,
        expiryDate = COALESCE(?, expiryDate),
        externalLinks = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        title || null,
        date || null,
        type || null,
        description || null,
        critical === 'true' || critical === true,
        expiryDate || null,
        typeof externalLinks === 'string' ? externalLinks : JSON.stringify(externalLinks || []),
        id
      ]
    );

    // Smart Link Handling during update
    // 1. If deletedFiles JSON is provided, remove those links
    if (req.body.deletedFiles) {
      const deletedFiles = typeof req.body.deletedFiles === 'string' 
        ? JSON.parse(req.body.deletedFiles) 
        : req.body.deletedFiles;
      
      if (Array.isArray(deletedFiles) && deletedFiles.length > 0) {
        const placeholders = deletedFiles.map(() => '?').join(',');
        await pool.query(
          `DELETE FROM notice_links WHERE noticeId = ? AND id IN (${placeholders})`, 
          [id, ...deletedFiles]
        );
      }
    }

    // 2. If physical files are uploaded, insert them
    if (files) {
      if (files['document']) {
        for (const file of files['document']) {
          const fileUrl = getUploadPath(file);
          const linkId = `LNK-${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const label = file.originalname || 'Attachment';
          await pool.query('INSERT INTO notice_links (id, noticeId, label, url, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), id, label, fileUrl, 'attachment']);
        }
      }
      if (files['formFile']) {
        for (const file of files['formFile']) {
          const fileUrl = getUploadPath(file);
          const linkId = `LNK-${Date.now()}${Math.random().toString().slice(2, 6)}`;
          const label = file.originalname || 'Form';
          await pool.query('INSERT INTO notice_links (id, noticeId, label, url, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), id, label, fileUrl, 'form']);
        }
      }
    }

    const [updatedNotice] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    const [currentLinks]: any = await pool.query('SELECT id, label, url, type FROM notice_links WHERE noticeId = ?', [id]);
    const noticeObj = (updatedNotice as any)[0];
    noticeObj.attachments = currentLinks.filter((l: any) => l.type === 'attachment' || l.type === 'form');
    try {
      noticeObj.externalLinks = noticeObj.externalLinks ? (typeof noticeObj.externalLinks === 'string' ? JSON.parse(noticeObj.externalLinks) : noticeObj.externalLinks) : [];
    } catch (e) {
      noticeObj.externalLinks = [];
    }
    return res.json(ApiResponse.success(formatDataUrls(noticeObj, ['url']), 'Notice updated successfully'));
  }
});

export const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM notices WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Notice not found');
  }

  res.json(ApiResponse.success(null, 'Notice deleted successfully'));
});
