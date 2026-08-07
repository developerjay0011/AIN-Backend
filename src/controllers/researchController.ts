import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { getUploadPath, formatDataUrls } from '../utils/urlHelper.js';

// Get all research data
export const getResearchData = asyncHandler(async (req: Request, res: Response) => {
  const [initiatives] = await pool.query('SELECT * FROM research_initiatives ORDER BY createdAt DESC');
  const [ircMembers] = await pool.query('SELECT * FROM research_irc_members ORDER BY id ASC');
  const [bulletins] = await pool.query('SELECT * FROM research_bulletins ORDER BY createdAt DESC');
  const [cellRows] = await pool.query('SELECT * FROM research_cell LIMIT 1');
  
  let cell = cellRows && (cellRows as any[]).length > 0 ? (cellRows as any[])[0] : null;
  if (cell) {
    cell = formatDataUrls(cell, ['image']);
    if (typeof cell.points === 'string') {
      try {
        cell.points = JSON.parse(cell.points);
      } catch (e) {
        cell.points = [];
      }
    }
    if (typeof cell.submissionSteps === 'string') {
      try {
        cell.submissionSteps = JSON.parse(cell.submissionSteps);
      } catch (e) {
        cell.submissionSteps = [];
      }
    }
  }

  res.json(ApiResponse.success({
    initiatives,
    ircMembers,
    bulletins: formatDataUrls(bulletins, ['fileUrl']),
    cell
  }, 'Research data fetched successfully'));
});

// Initiatives CRUD
export const createInitiative = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, status, lead, category } = req.body;
  if (!title || !description || !status || !lead || !category) {
    throw new ApiError(400, 'All fields are required');
  }

  const [result] = await pool.query(
    'INSERT INTO research_initiatives (title, description, status, lead, category) VALUES (?, ?, ?, ?, ?)',
    [sanitizeString(title), sanitizeString(description), sanitizeString(status), sanitizeString(lead), sanitizeString(category)]
  );

  res.json(ApiResponse.success({ id: (result as any).insertId }, 'Research initiative created successfully'));
});

export const updateInitiative = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status, lead, category } = req.body;

  if (!title || !description || !status || !lead || !category) {
    throw new ApiError(400, 'All fields are required');
  }

  await pool.query(
    'UPDATE research_initiatives SET title = ?, description = ?, status = ?, lead = ?, category = ? WHERE id = ?',
    [sanitizeString(title), sanitizeString(description), sanitizeString(status), sanitizeString(lead), sanitizeString(category), id]
  );

  res.json(ApiResponse.success(null, 'Research initiative updated successfully'));
});

export const deleteInitiative = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM research_initiatives WHERE id = ?', [id]);
  res.json(ApiResponse.success(null, 'Research initiative deleted successfully'));
});

// IRC Members CRUD
export const createIrcMember = asyncHandler(async (req: Request, res: Response) => {
  const { name, role, specialization } = req.body;
  if (!name || !role || !specialization) {
    throw new ApiError(400, 'All fields are required');
  }

  const [result] = await pool.query(
    'INSERT INTO research_irc_members (name, role, specialization) VALUES (?, ?, ?)',
    [sanitizeString(name), sanitizeString(role), sanitizeString(specialization)]
  );

  res.json(ApiResponse.success({ id: (result as any).insertId }, 'IRC member created successfully'));
});

export const updateIrcMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, role, specialization } = req.body;

  if (!name || !role || !specialization) {
    throw new ApiError(400, 'All fields are required');
  }

  await pool.query(
    'UPDATE research_irc_members SET name = ?, role = ?, specialization = ? WHERE id = ?',
    [sanitizeString(name), sanitizeString(role), sanitizeString(specialization), id]
  );

  res.json(ApiResponse.success(null, 'IRC member updated successfully'));
});

export const deleteIrcMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM research_irc_members WHERE id = ?', [id]);
  res.json(ApiResponse.success(null, 'IRC member deleted successfully'));
});

// Bulletins CRUD
export const createBulletin = asyncHandler(async (req: Request, res: Response) => {
  const { title, date, description } = req.body;

  // Extract file URL from uploaded files or request body fallback
  const files = req.files as Express.Multer.File[] | undefined;
  const fileUrl = (files && files.length > 0) ? getUploadPath(files[0]) : req.body.fileUrl;

  let calculatedType = req.body.type || 'PDF';
  let calculatedSize = req.body.size || '0.0 MB';

  if (files && files.length > 0) {
    const file = files[0];
    calculatedType = file.originalname.split('.').pop()?.toUpperCase() || 'PDF';
    calculatedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (!title || !date) {
    throw new ApiError(400, 'Title and date are required');
  }

  const [result] = await pool.query(
    'INSERT INTO research_bulletins (title, date, size, type, description, fileUrl) VALUES (?, ?, ?, ?, ?, ?)',
    [
      sanitizeString(title),
      sanitizeString(date),
      sanitizeString(calculatedSize),
      sanitizeString(calculatedType),
      description ? sanitizeString(description) : null,
      fileUrl ? sanitizeString(fileUrl) : null
    ]
  );

  res.json(ApiResponse.success({ id: (result as any).insertId }, 'Research bulletin created successfully'));
});

export const updateBulletin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  // Extract file URL from uploaded files, request body, or keep existing
  const files = req.files as Express.Multer.File[] | undefined;
  let fileUrl = (files && files.length > 0) ? getUploadPath(files[0]) : req.body.fileUrl;

  // Fetch existing record to keep current file/image if not uploaded
  const [existing] = await pool.query('SELECT fileUrl, size, type FROM research_bulletins WHERE id = ?', [id]);
  const existingRow = (existing as any[])[0];

  if (!fileUrl && existingRow) {
    fileUrl = existingRow.fileUrl;
  }

  let calculatedType = req.body.type || (existingRow ? existingRow.type : 'PDF');
  let calculatedSize = req.body.size || (existingRow ? existingRow.size : '0.0 MB');

  if (files && files.length > 0) {
    const file = files[0];
    calculatedType = file.originalname.split('.').pop()?.toUpperCase() || 'PDF';
    calculatedSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (!title || !date) {
    throw new ApiError(400, 'Title and date are required');
  }

  await pool.query(
    'UPDATE research_bulletins SET title = ?, date = ?, size = ?, type = ?, description = ?, fileUrl = ? WHERE id = ?',
    [
      sanitizeString(title),
      sanitizeString(date),
      sanitizeString(calculatedSize),
      sanitizeString(calculatedType),
      description ? sanitizeString(description) : null,
      fileUrl ? sanitizeString(fileUrl) : null,
      id
    ]
  );

  res.json(ApiResponse.success(null, 'Research bulletin updated successfully'));
});

export const deleteBulletin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM research_bulletins WHERE id = ?', [id]);
  res.json(ApiResponse.success(null, 'Research bulletin deleted successfully'));
});

export const updateResearchCell = asyncHandler(async (req: Request, res: Response) => {
  const { description, points, ircDescription, submissionSteps } = req.body;
  if (!description || !points || !ircDescription) {
    throw new ApiError(400, 'Description, focus points list, and IRC description are required');
  }

  // Handle uploaded image
  const files = req.files as Express.Multer.File[] | undefined;
  let image = (files && files.length > 0) ? getUploadPath(files[0]) : req.body.image;

  // If no new image, keep the existing one
  if (!image) {
    const [existing] = await pool.query('SELECT image FROM research_cell LIMIT 1');
    const existingRow = (existing as any[])[0];
    image = existingRow ? existingRow.image : null;
  }

  let pointsValue = points;
  if (typeof points === 'string') {
    try {
      pointsValue = JSON.parse(points);
    } catch (e) {
      pointsValue = points;
    }
  }
  const pointsSerialized = Array.isArray(pointsValue) ? JSON.stringify(pointsValue) : pointsValue;

  let stepsValue = submissionSteps;
  if (typeof submissionSteps === 'string') {
    try {
      stepsValue = JSON.parse(submissionSteps);
    } catch (e) {
      stepsValue = submissionSteps;
    }
  }
  const stepsSerialized = stepsValue ? (Array.isArray(stepsValue) ? JSON.stringify(stepsValue) : stepsValue) : null;

  // Check if a row exists in research_cell
  const [rows] = await pool.query('SELECT id FROM research_cell LIMIT 1');
  if ((rows as any[]).length === 0) {
    await pool.query(
      'INSERT INTO research_cell (description, points, image, ircDescription, submissionSteps) VALUES (?, ?, ?, ?, ?)',
      [
        sanitizeString(description),
        sanitizeString(pointsSerialized),
        image ? sanitizeString(image) : null,
        sanitizeString(ircDescription),
        stepsSerialized ? sanitizeString(stepsSerialized) : null
      ]
    );
  } else {
    const rowId = (rows as any[])[0].id;
    await pool.query(
      'UPDATE research_cell SET description = ?, points = ?, image = ?, ircDescription = ?, submissionSteps = ? WHERE id = ?',
      [
        sanitizeString(description),
        sanitizeString(pointsSerialized),
        image ? sanitizeString(image) : null,
        sanitizeString(ircDescription),
        stepsSerialized ? sanitizeString(stepsSerialized) : null,
        rowId
      ]
    );
  }

  // Fetch and return the updated row
  const [updatedRows] = await pool.query('SELECT * FROM research_cell LIMIT 1');
  let cell = (updatedRows as any[])[0];
  if (cell) {
    cell = formatDataUrls(cell, ['image']);
    if (typeof cell.points === 'string') {
      try {
        cell.points = JSON.parse(cell.points);
      } catch (e) {
        cell.points = [];
      }
    }
    if (typeof cell.submissionSteps === 'string') {
      try {
        cell.submissionSteps = JSON.parse(cell.submissionSteps);
      } catch (e) {
        cell.submissionSteps = [];
      }
    }
  }

  res.json(ApiResponse.success(cell, 'Research cell details updated successfully'));
});
