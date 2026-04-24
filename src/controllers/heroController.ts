import pool from '../config/db.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllHeroSlides = asyncHandler(async (req: Request, res: Response) => {
  const { tag } = req.query;
  let query = 'SELECT id, imageUrl, tag, `order`, createdAt, updatedAt FROM hero_slides';
  const params: any[] = [];

  if (tag) {
    query += ' WHERE tag = ?';
    params.push(tag);
  }

  query += ' ORDER BY `order` ASC, createdAt DESC';

  const [rows] = await pool.query(query, params);
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Hero slides fetched successfully'));
});

export const handleHeroPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, order, tag } = sanitizeObject(req.body);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0) {
    // Create
    if (!imageUrl) {
      throw new ApiError(400, 'Image is required');
    }

    const newId = `SLD-${Date.now()}`;
    const query = `
      INSERT INTO hero_slides (id, imageUrl, \`order\`, tag)
      VALUES (?, ?, ?, ?)
    `;

    await pool.query(query, [
      newId,
      imageUrl,
      parseInt(order as string) || 0,
      tag || 'main'
    ]);

    const [newSlide] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newSlide as any)[0], ['imageUrl']), 'Hero slide created successfully'));
  } else {
    // Update
    const [existing]: any = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Hero slide not found');
    }

    const query = `
      UPDATE hero_slides 
      SET imageUrl = COALESCE(?, imageUrl),
          \`order\` = COALESCE(?, \`order\`),
          tag = COALESCE(?, tag),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await pool.query(query, [
      imageUrl,
      order !== undefined ? parseInt(order as string) : null,
      tag || null,
      id
    ]);

    const [updatedSlide] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedSlide as any)[0], ['imageUrl']), 'Hero slide updated successfully'));
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
