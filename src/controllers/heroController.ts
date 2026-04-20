import pool from '../config/db.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
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
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0) {
    // Create
    if (!imageUrl) {
      throw new ApiError(400, 'Image is required');
    }

    const slideTag = tag || 'main';
    const slideOrder = parseInt(order as string) || 0;

    // Check for duplicate order in the same tag
    const [existingSlides]: any = await pool.query(
      'SELECT id FROM hero_slides WHERE tag = ? AND `order` = ?',
      [slideTag, slideOrder]
    );

    if (existingSlides.length > 0) {
      throw new ApiError(400, `A slide with tag "${slideTag}" and order ${slideOrder} already exists.`);
    }

    const newId = `SLD-${Date.now()}`;
    const query = `
      INSERT INTO hero_slides (id, imageUrl, \`order\`, isActive, tag)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      newId,
      imageUrl,
      slideOrder,
      isActive === 'true' || isActive === true,
      slideTag
    ]);

    const [newSlide] = await pool.query('SELECT * FROM hero_slides WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newSlide as any)[0]), 'Hero slide created successfully'));
  } else {
    const [currentSlide]: any = await pool.query('SELECT tag, `order` FROM hero_slides WHERE id = ?', [id]);
    if (currentSlide.length === 0) {
      throw new ApiError(404, 'Hero slide not found');
    }

    const finalTag = tag || currentSlide[0].tag;
    const finalOrder = order !== undefined ? parseInt(order as string) : currentSlide[0].order;

    // Check for duplicate order in the same tag (excluding the current slide)
    const [duplicateSlides]: any = await pool.query(
      'SELECT id FROM hero_slides WHERE tag = ? AND `order` = ? AND id != ?',
      [finalTag, finalOrder, id]
    );

    if (duplicateSlides.length > 0) {
      throw new ApiError(400, `A slide with tag "${finalTag}" and order ${finalOrder} already exists.`);
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
      order !== undefined ? parseInt(order as string) : null,
      isActive !== undefined ? (isActive === 'true' || isActive === true) : null,
      tag || null,
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
