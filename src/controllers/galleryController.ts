import pool from '../config/db.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { sanitizeString, sanitizeObject } from '../utils/sanitize.js';

import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const [events] = await pool.query('SELECT * FROM gallery_events ORDER BY date DESC');

  for (let event of events as any[]) {
    const [media] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE eventId = ?', [event.id]);
    event.media = media;
    // Parse highlights if they exist (stored as JSON string in SQLite/MySQL)
    if (event.highlights && typeof event.highlights === 'string') {
      try {
        event.highlights = JSON.parse(event.highlights);
      } catch (e) {
        event.highlights = [];
      }
    } else if (!event.highlights) {
      event.highlights = [];
    }
  }

  res.json(ApiResponse.success(formatDataUrls(events, ['url']), 'Events fetched successfully'));
});

export const handleGalleryPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, description, date, startTime, endTime, location, mainTag, media, highlights } = sanitizeObject(req.body);

  if (id === '0' || !id || id === 0) {
    if (!name) {
      throw new ApiError(400, 'Event name is required');
    }

    const eventId = `EVT-${Date.now()}`;
    await pool.query(
      'INSERT INTO gallery_events (id, name, description, date, startTime, endTime, location, mainTag, highlights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [eventId, name, description, date, startTime, endTime, location, mainTag, highlights]
    );

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const mediaId = `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const url = getUploadPath(file);
        const type = file.mimetype.startsWith('video/') ? 'video' : 'photo';
        await pool.query(
          'INSERT INTO gallery_media (id, eventId, type, url, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [mediaId, eventId, type, url, sanitizeString(file.originalname)]
        );
      }
    }

    if (media) {
      const mediaArray = typeof media === 'string' ? JSON.parse(media) : media;
      for (const m of mediaArray) {
        if (!m.id) {
          const mediaId = `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await pool.query(
            'INSERT INTO gallery_media (id, eventId, type, url, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            [mediaId, eventId, m.type || 'photo', m.url, sanitizeString(m.name)]
          );
        }
      }
    }

    const [newEvent] = await pool.query('SELECT * FROM gallery_events WHERE id = ?', [eventId]);
    const [newMedia] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE eventId = ?', [eventId]);
    (newEvent as any)[0].media = newMedia;
    return res.status(201).json(ApiResponse.success(formatDataUrls((newEvent as any)[0], ['url']), 'Event created successfully'));
  } else {
    const [existing] = await pool.query('SELECT * FROM gallery_events WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Event not found');
    }

    await pool.query(
      `UPDATE gallery_events SET 
        name = COALESCE(?, name), 
        description = COALESCE(?, description), 
        date = COALESCE(?, date), 
        startTime = COALESCE(?, startTime),
        endTime = COALESCE(?, endTime),
        location = COALESCE(?, location),
        mainTag = COALESCE(?, mainTag),
        highlights = COALESCE(?, highlights),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, description, date, startTime, endTime, location, mainTag, highlights, id]
    );

    // Delete media items that were removed in the form
    const { deleteMediaIds } = req.body;
    if (deleteMediaIds) {
      const idsToDelete: string[] = typeof deleteMediaIds === 'string'
        ? JSON.parse(deleteMediaIds)
        : deleteMediaIds;

      for (const mediaId of idsToDelete) {
        await pool.query('DELETE FROM gallery_media WHERE id = ? AND eventId = ?', [mediaId, id]);
      }
    }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const mediaId = `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const url = getUploadPath(file);
        const type = file.mimetype.startsWith('video/') ? 'video' : 'photo';
        await pool.query(
          'INSERT INTO gallery_media (id, eventId, type, url, name, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [mediaId, id, type, url, sanitizeString(file.originalname)]
        );
      }
    }

    const [updatedEvent] = await pool.query('SELECT * FROM gallery_events WHERE id = ?', [id]);
    const [currentMedia] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE eventId = ?', [id]);
    (updatedEvent as any)[0].media = currentMedia;
    return res.json(ApiResponse.success(formatDataUrls((updatedEvent as any)[0], ['url']), 'Event updated successfully'));
  }
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM gallery_events WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Event not found');
  }

  res.json(ApiResponse.success(null, 'Event deleted successfully'));
});
