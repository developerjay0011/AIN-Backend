import pool from '../config/db.js';
import { Request, Response } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { sanitizeObject, formatDateToYYYYMMDD } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const [events] = await pool.query('SELECT * FROM events ORDER BY date DESC');

  for (let event of events as any[]) {
    // Parse highlights if they exist (stored as JSON string)
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

  res.json(ApiResponse.success(formatDataUrls(events, ['coverImage']), 'Events fetched successfully'));
});

export const handleEventPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, name, description, date, startTime, endTime, location, mainTag, highlights } = sanitizeObject(req.body);
  date = formatDateToYYYYMMDD(date);

  let coverImageUrl = req.body.coverImage || '';
  if (req.file) {
    coverImageUrl = getUploadPath(req.file);
  }

  if (id === '0' || !id || id === 0) {
    if (!name) {
      throw new ApiError(400, 'Event name is required');
    }

    const eventId = `EVT-${Date.now()}`;
    await pool.query(
      'INSERT INTO events (id, name, description, date, startTime, endTime, location, mainTag, highlights, coverImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [eventId, name, description, date, startTime, endTime, location, mainTag, highlights, coverImageUrl]
    );

    const [newEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newEvent as any)[0], ['coverImage']), 'Event created successfully'));
  } else {
    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if ((existing as any).length === 0) {
      throw new ApiError(404, 'Event not found');
    }

    await pool.query(
      `UPDATE events SET 
        name = COALESCE(?, name), 
        description = COALESCE(?, description), 
        date = COALESCE(?, date), 
        startTime = COALESCE(?, startTime),
        endTime = COALESCE(?, endTime),
        location = COALESCE(?, location),
        mainTag = COALESCE(?, mainTag),
        highlights = COALESCE(?, highlights),
        coverImage = CASE WHEN ? = '' THEN coverImage ELSE ? END,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, description, date, startTime, endTime, location, mainTag, highlights, coverImageUrl, coverImageUrl, id]
    );

    const [updatedEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedEvent as any)[0], ['coverImage']), 'Event updated successfully'));
  }
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Event not found');
  }

  res.json(ApiResponse.success(null, 'Event deleted successfully'));
});
