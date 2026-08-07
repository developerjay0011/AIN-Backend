import pool from '../config/db.js';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { sanitizeObject } from '../utils/sanitize.js';

export const getCalendarData = asyncHandler(async (req: Request, res: Response) => {
  const [events] = await pool.query('SELECT * FROM academic_calendar');
  const [notes] = await pool.query('SELECT * FROM academic_calendar_notes ORDER BY program, semester');

  // Helper to parse DD/MM/YY or DD/MM/YYYY
  const parseDate = (dateStr: string | null | undefined) => {
    if (!dateStr || typeof dateStr !== 'string') return 0;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (parts[2].length === 2) {
        year += year < 70 ? 2000 : 1900;
      }
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.getTime();
      }
    }
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Sort events by program, semester, then dateFrom
  (events as any[]).sort((a, b) => {
    const progA = (a.program || '').toLowerCase();
    const progB = (b.program || '').toLowerCase();
    if (progA !== progB) return progA.localeCompare(progB);

    const semA = (a.semester || '').toLowerCase();
    const semB = (b.semester || '').toLowerCase();
    if (semA !== semB) return semA.localeCompare(semB);

    const dateA = parseDate(a.dateFrom);
    const dateB = parseDate(b.dateFrom);
    return dateA - dateB;
  });

  // Re-index sl sequentially for the sorted list per program + semester group
  const counts = new Map<string, number>();
  for (const e of events as any[]) {
    const key = `${e.program.toLowerCase()}|||${e.semester.toLowerCase()}`;
    const idx = (counts.get(key) || 0) + 1;
    counts.set(key, idx);
    e.sl = idx;
  }

  res.json(ApiResponse.success({
    events,
    notes
  }, 'Academic calendar data fetched successfully'));
});

export const updateCalendarData = asyncHandler(async (req: Request, res: Response) => {
  const { program, semester, events, notes } = req.body;

  if (!program || !semester) {
    throw new ApiError(400, 'Program and Semester are required');
  }

  // Use a transaction to ensure database consistency
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Delete existing events for this program and semester
    await connection.query(
      'DELETE FROM academic_calendar WHERE program = ? AND semester = ?',
      [program, semester]
    );

    // 2. Insert new events
    if (Array.isArray(events)) {
      // Helper to parse DD/MM/YY or DD/MM/YYYY
      const parseDate = (dateStr: string | null | undefined) => {
        if (!dateStr || typeof dateStr !== 'string') return 0;
        const parts = dateStr.trim().split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          let year = parseInt(parts[2], 10);
          if (parts[2].length === 2) {
            year += year < 70 ? 2000 : 1900;
          }
          const d = new Date(year, month, day);
          if (!isNaN(d.getTime())) {
            return d.getTime();
          }
        }
        const parsed = Date.parse(dateStr);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Sort input events by dateFrom
      const sortedEvents = [...events].sort((a, b) => {
        const dateA = parseDate(a.dateFrom);
        const dateB = parseDate(b.dateFrom);
        return dateA - dateB;
      });

      let sl = 1;
      for (const event of sortedEvents) {
        const id = `CAL-${program.toUpperCase()}-${semester.replace(/\s+/g, '').toUpperCase()}-${Date.now()}-${sl}`;
        await connection.query(
          'INSERT INTO academic_calendar (id, program, semester, sl, activity, dateFrom, dateTo, weeks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, program, semester, sl++, event.activity || '', event.dateFrom || '', event.dateTo || '', event.weeks || '']
        );
      }
    }

    // 3. Delete existing notes for this program and semester
    await connection.query(
      'DELETE FROM academic_calendar_notes WHERE program = ? AND semester = ?',
      [program, semester]
    );

    // 4. Insert new notes
    if (Array.isArray(notes)) {
      let noteIdx = 1;
      for (const note of notes) {
        const id = `NOT-${program.toUpperCase()}-${semester.replace(/\s+/g, '').toUpperCase()}-${Date.now()}-${noteIdx++}`;
        await connection.query(
          'INSERT INTO academic_calendar_notes (id, program, semester, label, planned, prescribed) VALUES (?, ?, ?, ?, ?, ?)',
          [id, program, semester, note.label || '', note.planned || '', note.prescribed || '']
        );
      }
    }

    await connection.commit();
    connection.release();

    res.json(ApiResponse.success(null, 'Academic calendar updated successfully'));
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
});
