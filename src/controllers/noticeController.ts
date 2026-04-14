import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls } from '../utils/urlHelper.js';

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
  const { id, title, date, type, description, critical, links } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  if (id === '0' || !id || id === 0 || id === 'null') {
    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    const noticeId = `NOT-${Date.now()}`;
    await pool.query(
      'INSERT INTO notices (id, title, date, type, description, critical) VALUES (?, ?, ?, ?, ?, ?)',
      [noticeId, title, date, type, description, critical === 'true' || critical === true]
    );

    // Handle existing links from JSON string/array
    if (links) {
      const linksArray = typeof links === 'string' ? JSON.parse(links) : links;
      for (const link of linksArray) {
          const linkId = `LNK-${Date.now()}${Math.floor(Math.random() * 100)}`;
          await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, link.label, link.url]);
      }
    }

    // Handle multiple uploaded files
    if (files) {
      if (files['document']) {
        const fileUrl = `/uploads/documents/${files['document'][0].filename}`;
        const linkId = `LNK-${Date.now()}${Math.random().toString().slice(2, 5)}`;
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, 'Attachment', fileUrl]);
      }
      if (files['formFile']) {
        const fileUrl = `/uploads/documents/${files['formFile'][0].filename}`;
        const linkId = `LNK-${Date.now() + 1}`; // Ensure uniqueness
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId.substring(0, 20), noticeId, 'Form Document', fileUrl]);
      }
    }

    const [newNotice] = await pool.query('SELECT * FROM notices WHERE id = ?', [noticeId]);
    const [newLinks] = await pool.query('SELECT label, url FROM notice_links WHERE noticeId = ?', [noticeId]);
    (newNotice as any)[0].links = newLinks;
    return res.status(201).json(ApiResponse.success(formatDataUrls((newNotice as any)[0]), 'Notice published successfully'));
  } else {
    const [existing] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Notice not found');
    }

    await pool.query(
      `UPDATE notices SET 
        title = COALESCE(?, title), 
        date = COALESCE(?, date), 
        type = COALESCE(?, type), 
        description = COALESCE(?, description), 
        critical = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [title, date, type, description, critical === 'true' || critical === true, id]
    );

    // Handle multiple uploaded files during update
    if (files) {
      if (files['document']) {
        const fileUrl = `/uploads/documents/${files['document'][0].filename}`;
        const linkId = `LNK-${Date.now()}`.substring(0, 20);
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId, id, 'Updated Attachment', fileUrl]);
      }
      if (files['formFile']) {
        const fileUrl = `/uploads/documents/${files['formFile'][0].filename}`;
        const linkId = `LNK-${Date.now() + 1}`.substring(0, 20);
        await pool.query('INSERT INTO notice_links (id, noticeId, label, url, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [linkId, id, 'Updated Form Document', fileUrl]);
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
