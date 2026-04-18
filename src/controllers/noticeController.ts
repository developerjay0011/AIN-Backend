import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { sanitizeString, sanitizeObject } from '../utils/sanitize.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllNotices = asyncHandler(async (req: Request, res: Response) => {
  const [notices] = await pool.query('SELECT * FROM notices ORDER BY createdAt DESC');

  for (let notice of notices as any[]) {
    const [links] = await pool.query('SELECT label, url FROM notice_links WHERE noticeId = ?', [notice.id]);
    notice.links = links;
  }

  res.json(ApiResponse.success(formatDataUrls(notices), 'Notices fetched successfully'));
});

export const handleNoticePost = asyncHandler(async (req: Request, res: Response) => {
  const { id, title, date, type, description, critical, links } = sanitizeObject(req.body);
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  // Standardized image handling for notices
  const imageUrl = (files && files['image']) 
    ? getUploadPath(files['image'][0]) 
    : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0 || id === 'null') {
    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    const noticeId = `NOT-${Date.now()}`;
    await pool.query(
      'INSERT INTO notices (id, title, date, type, description, critical, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [noticeId, title, date, type, description, critical === 'true' || critical === true, imageUrl]
    );

    // Handle existing links from JSON string/array
    if (links) {
      const linksArray = typeof links === 'string' ? JSON.parse(links) : links;
      for (const link of linksArray) {
        const linkId = `LNK-${Date.now()}${Math.floor(Math.random() * 100)}`;
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, sanitizeString(link.label), sanitizeString(link.url)]);
      }
    }

    // Handle multiple uploaded files
    if (files) {
      if (files['document']) {
        const fileUrl = getUploadPath(files['document'][0]);
        const linkId = `LNK-${Date.now()}${Math.random().toString().slice(2, 5)}`;
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, 'Attachment', fileUrl]);
      }
      if (files['formFile']) {
        const fileUrl = getUploadPath(files['formFile'][0]);
        const linkId = `LNK-${Date.now() + 1}`; // Ensure uniqueness
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, 'Form', fileUrl]);
      }
    }

    const [newNotice] = await pool.query('SELECT * FROM notices WHERE id = ?', [noticeId]);
    const [newLinks] = await pool.query('SELECT label, url FROM notice_links WHERE noticeId = ?', [noticeId]);
    (newNotice as any)[0].links = newLinks;
    return res.status(201).json(ApiResponse.success(formatDataUrls((newNotice as any)[0]), 'Notice published successfully'));
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
        imageUrl = COALESCE(?, imageUrl),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title || null, date || null, type || null, description || null, critical === 'true' || critical === true, imageUrl, id]
    );

    // Smart Link Handling during update
    // 1. If explicit links JSON is provided, perform a full sync
    if (links) {
      const linksArray = typeof links === 'string' ? JSON.parse(links) : links;
      await pool.query('DELETE FROM notice_links WHERE noticeId = ?', [id]);
      for (const link of linksArray) {
        if (link.url) {
          const lId = link.id || `LNK-${Date.now()}${Math.floor(Math.random() * 100)}`;
          await pool.query(
            'INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [lId.toString().substring(0, 20), id, sanitizeString(link.label), sanitizeString(link.url)]
          );
        }
      }
    }

    // 2. If physical files are uploaded, replace ONLY the corresponding labeled links
    if (files) {
      if (files['document']) {
        await pool.query("DELETE FROM notice_links WHERE noticeId = ? AND label = 'Attachment'", [id]);
        const fileUrl = getUploadPath(files['document'][0]);
        const linkId = `LNK-${Date.now()}${(Math.random() * 10).toFixed(0)}`;
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), id, 'Attachment', fileUrl]);
      }
      if (files['formFile']) {
        await pool.query("DELETE FROM notice_links WHERE noticeId = ? AND label = 'Form'", [id]);
        const fileUrl = getUploadPath(files['formFile'][0]);
        const linkId = `LNK-${Date.now() + 1}`; 
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), id, 'Form', fileUrl]);
      }
    }

    const [updatedNotice] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    const [currentLinks] = await pool.query('SELECT label, url FROM notice_links WHERE noticeId = ?', [id]);
    (updatedNotice as any)[0].links = currentLinks;
    return res.json(ApiResponse.success(formatDataUrls((updatedNotice as any)[0]), 'Notice updated successfully'));
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
