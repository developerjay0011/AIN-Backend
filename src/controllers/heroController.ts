import pool from '../config/db.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllHeroSlides = asyncHandler(async (req: Request, res: Response) => {
  const { tag } = req.query;
  let query = 'SELECT id, imageUrl, tag, `order`, isActive, createdAt, updatedAt FROM hero_slides';
  const params: any[] = [];

  if (tag) {
    query += ' WHERE tag = ?';
    params.push(tag);
  }

  query += ' ORDER BY `order` ASC, createdAt DESC';

  const [rows] = await pool.query(query, params);
  res.json(ApiResponse.success(formatDataUrls(rows), 'Hero slides fetched successfully'));
});

export const handleHeroPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, order, isActive, tag } = sanitizeObject(req.body);
  const imageUrl = req.file ? `/uploads/images/${req.file.filename}` : req.body.imageUrl;

  if (id === '0' || !id || id === 0) {
    // Create
    if (!imageUrl) {
      throw new ApiError(400, 'Image is required');
    }

    const newId = `SLD-${Date.now()}`;
    // We keep 'title' as empty string for DB compatibility (NOT NULL constraint)
    const query = `
      INSERT INTO hero_slides (id, imageUrl, link, \`order\`, isActive, tag)
      VALUES (?, ?, '', ?, ?, ?)
    `;

    await pool.query(query, [
      newId,
      imageUrl,
      parseInt(order) || 0,
      isActive === 'true' || isActive === true,
      tag || 'main'
    ]);

    const [newSlide] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newSlide as any)[0]), 'Hero slide created successfully'));
  } else {
    // Update
    const [existing] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Hero slide not found');
    }

    const query = `
      UPDATE hero_slides 
      SET imageUrl = COALESCE(?, imageUrl),
          \`order\` = COALESCE(?, \`order\`),
          isActive = COALESCE(?, isActive),
          tag = COALESCE(?, tag),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [
      imageUrl,
      order !== undefined ? parseInt(order) : undefined,
      isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
      tag,
      id
    ]);

    const [updatedSlide] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedSlide as any)[0]), 'Hero slide updated successfully'));
  }
});

export const deleteHeroSlide = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM hero_slides WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Hero slide not found');
  }

  res.json(ApiResponse.success(null, 'Hero slide deleted successfully'));
});
