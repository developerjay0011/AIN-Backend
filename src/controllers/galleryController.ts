import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls } from '../utils/urlHelper.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

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
  
  res.json(ApiResponse.success(formatDataUrls(events), 'Events fetched successfully'));
});

export const handleGalleryPost = asyncHandler(async (req: Request, res: Response) => {
        const { id, name, description, date, startTime, endTime, location, mainTag, media, highlights } = req.body;
        
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
        const mediaId = `MED-${Date.now()}`;
        const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
        const url = `/uploads/${folder}/${file.filename}`;
        const type = file.mimetype.startsWith('video/') ? 'video' : 'photo';
        await pool.query(
          'INSERT INTO gallery_media (id, eventId, type, url, name) VALUES (?, ?, ?, ?, ?)',
          [mediaId, eventId, type, url, file.originalname]
        );
      }
    }

    if (media) {
      const mediaArray = typeof media === 'string' ? JSON.parse(media) : media;
      for (const m of mediaArray) {
        if (!m.id) {
          const mediaId = `MED-${Date.now()}`;
          await pool.query(
            'INSERT INTO gallery_media (id, eventId, type, url, name) VALUES (?, ?, ?, ?, ?)',
            [mediaId, eventId, m.type || 'photo', m.url, m.name]
          );
        }
      }
    }

    const [newEvent] = await pool.query('SELECT * FROM gallery_events WHERE id = ?', [eventId]);
    const [newMedia] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE eventId = ?', [eventId]);
    (newEvent as any)[0].media = newMedia;
    return res.status(201).json(ApiResponse.success(formatDataUrls((newEvent as any)[0]), 'Event created successfully'));
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
        const mediaId = `MED-${Date.now()}`;
        const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
        const url = `/uploads/${folder}/${file.filename}`;
        const type = file.mimetype.startsWith('video/') ? 'video' : 'photo';
        await pool.query(
          'INSERT INTO gallery_media (id, eventId, type, url, name) VALUES (?, ?, ?, ?, ?)',
          [mediaId, id, type, url, file.originalname]
        );
      }
    }

    const [updatedEvent] = await pool.query('SELECT * FROM gallery_events WHERE id = ?', [id]);
    const [currentMedia] = await pool.query('SELECT id, type, url, name FROM gallery_media WHERE eventId = ?', [id]);
    (updatedEvent as any)[0].media = currentMedia;
    return res.json(ApiResponse.success(formatDataUrls((updatedEvent as any)[0]), 'Event updated successfully'));
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
