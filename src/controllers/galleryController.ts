import pool from '../config/db.js';
import { Request, Response } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { sanitizeString, sanitizeObject } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const [albums] = await pool.query('SELECT * FROM gallery_albums ORDER BY createdAt DESC');

  for (let album of albums as any[]) {
    const [media] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE albumId = ?', [album.id]);
    album.media = media;
  }

  res.json(ApiResponse.success(formatDataUrls(albums, ['url', 'coverImage']), 'Gallery albums fetched successfully'));
});

export const handleGalleryPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, name, description, media } = sanitizeObject(req.body);

  let coverImageUrl = req.body.coverImage || '';
  // If files are uploaded, we can set the first one as coverImage if coverImage is empty
  if (req.files && Array.isArray(req.files) && req.files.length > 0 && !coverImageUrl) {
    coverImageUrl = getUploadPath(req.files[0]);
  }

  if (id === '0' || !id || id === 0) {
    if (!name) {
      throw new ApiError(400, 'Album name is required');
    }

    const albumId = `ALB-${Date.now()}`;
    await pool.query(
      'INSERT INTO gallery_albums (id, name, description, coverImage) VALUES (?, ?, ?, ?)',
      [albumId, name, description, coverImageUrl]
    );

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const mediaId = `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const url = getUploadPath(file);
        const type = file.mimetype.startsWith('video/') ? 'video' : 'photo';
        await pool.query(
          'INSERT INTO gallery_media (id, albumId, type, url, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [mediaId, albumId, type, url, sanitizeString(file.originalname)]
        );
      }
    }

    if (media) {
      const mediaArray = typeof media === 'string' ? JSON.parse(media) : media;
      for (const m of mediaArray) {
        if (!m.id) {
          const mediaId = `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await pool.query(
            'INSERT INTO gallery_media (id, albumId, type, url, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [mediaId, albumId, m.type || 'photo', m.url, sanitizeString(m.name)]
          );
        }
      }
    }

    const [newAlbum] = await pool.query('SELECT * FROM gallery_albums WHERE id = ?', [albumId]);
    const [newMedia] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE albumId = ?', [albumId]);
    (newAlbum as any)[0].media = newMedia;
    return res.status(201).json(ApiResponse.success(formatDataUrls((newAlbum as any)[0], ['url', 'coverImage']), 'Album created successfully'));
  } else {
    const [existing] = await pool.query('SELECT * FROM gallery_albums WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Album not found');
    }

    await pool.query(
      `UPDATE gallery_albums SET 
        name = COALESCE(?, name), 
        description = COALESCE(?, description), 
        coverImage = CASE WHEN ? = '' THEN coverImage ELSE ? END,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, description, coverImageUrl, coverImageUrl, id]
    );

    // Delete media items that were removed in the form
    const { deleteMediaIds } = req.body;
    if (deleteMediaIds) {
      const idsToDelete: string[] = typeof deleteMediaIds === 'string'
        ? JSON.parse(deleteMediaIds)
        : deleteMediaIds;

      for (const mediaId of idsToDelete) {
        await pool.query('DELETE FROM gallery_media WHERE id = ? AND albumId = ?', [mediaId, id]);
      }
    }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const mediaId = `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const url = getUploadPath(file);
        const type = file.mimetype.startsWith('video/') ? 'video' : 'photo';
        await pool.query(
          'INSERT INTO gallery_media (id, albumId, type, url, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [mediaId, id, type, url, sanitizeString(file.originalname)]
        );
      }
    }

    const [updatedAlbum] = await pool.query('SELECT * FROM gallery_albums WHERE id = ?', [id]);
    const [currentMedia] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE albumId = ?', [id]);
    (updatedAlbum as any)[0].media = currentMedia;
    return res.json(ApiResponse.success(formatDataUrls((updatedAlbum as any)[0], ['url', 'coverImage']), 'Album updated successfully'));
  }
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM gallery_albums WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Album not found');
  }

  res.json(ApiResponse.success(null, 'Album deleted successfully'));
});
