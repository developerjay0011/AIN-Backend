import pool from '../config/db.js';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';
import { sanitizeString, sanitizeObject, formatDateToYYYYMMDD } from '../utils/sanitize.js';
import jwt from 'jsonwebtoken';

const isAdminRequest = (req: Request): boolean => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        jwt.verify(token, jwtSecret);
        return true;
      }
    }
  } catch (e) { }
  return false;
};

/**
 * Get all Alumni Milestones
 */
export const getAlumniHistory = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC, year DESC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Alumni history fetched successfully'));
});

/**
 * Update/Sync Alumni History
 * Handles bulk updates including reordering and image uploads
 */
export const syncAlumniHistory = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body.data ? JSON.parse(req.body.data) : req.body;
  const milestones = data.milestones || [];
  const files = req.files as Express.Multer.File[] | undefined;

  if (!Array.isArray(milestones)) {
    throw new ApiError(400, 'Invalid milestones data');
  }

  // Map uploaded files to fieldnames (e.g., "milestone_image_0")
  const fileMap: Record<string, string> = {};
  if (files) {
    files.forEach(file => {
      fileMap[file.fieldname] = getUploadPath(file) || '';
    });
  }

  // Identify milestones to delete
  const [currentRows] = await pool.query('SELECT id FROM alumni_milestones');
  const currentIds = (currentRows as any[]).map(row => row.id);
  const incomingIds = milestones.map((m: any) => m.id).filter((id: any) => id && id !== '0');
  const idsToDelete = currentIds.filter(id => !incomingIds.includes(id));

  if (idsToDelete.length > 0) {
    await pool.query('DELETE FROM alumni_milestones WHERE id IN (?)', [idsToDelete]);
  }

  // Insert or Update milestones
  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const imageKey = `milestone_image_${i}`;
    const imageUrl = fileMap[imageKey] || m.imageUrl || null;

    const payload = [
      sanitizeString(m.year) || null,
      sanitizeString(m.title) || null,
      sanitizeString(m.description || m.desc) || null,
      imageUrl,
      i // sortOrder
    ];

    if (!m.id || m.id === '0' || m.id === 0) {
      const newId = `ALM-${Date.now()}-${i}`;
      await pool.query(
        'INSERT INTO alumni_milestones (id, year, title, description, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, ...payload]
      );
    } else {
      await pool.query(
        'UPDATE alumni_milestones SET year = ?, title = ?, description = ?, imageUrl = ?, sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [...payload, m.id]
      );
    }
  }

  const [finalRows] = await pool.query('SELECT * FROM alumni_milestones ORDER BY sortOrder ASC');
  res.json(ApiResponse.success(formatDataUrls(finalRows, ['imageUrl']), 'Alumni history synchronized successfully'));
});

/**
 * Get all Alumni Activities
 */
export const getAlumniActivities = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_activities ORDER BY date DESC, createdAt DESC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Alumni activities fetched successfully'));
});

/**
 * Create or Update Alumni Activity
 */
export const handleActivityPost = asyncHandler(async (req: Request, res: Response) => {
  let { id, title, date, description } = sanitizeObject(req.body);
  date = formatDateToYYYYMMDD(date);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0) {
    if (!title) {
      throw new ApiError(400, 'Title is required');
    }
    const newId = `ACT-${Date.now()}`;
    await pool.query(
      'INSERT INTO alumni_activities (id, title, date, description, imageUrl) VALUES (?, ?, ?, ?, ?)',
      [newId, title, date || null, description || null, imageUrl]
    );
    const [newAct] = await pool.query('SELECT * FROM alumni_activities WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newAct as any)[0], ['imageUrl']), 'Activity created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_activities WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Activity not found');
    }
    await pool.query(
      'UPDATE alumni_activities SET title = COALESCE(?, title), date = COALESCE(?, date), description = COALESCE(?, description), imageUrl = COALESCE(?, imageUrl), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title, date, description, imageUrl, id]
    );
    const [updatedAct] = await pool.query('SELECT * FROM alumni_activities WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedAct as any)[0], ['imageUrl']), 'Activity updated successfully'));
  }
});

/**
 * Delete Alumni Activity
 */
export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_activities WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Activity not found');
  }
  res.json(ApiResponse.success(null, 'Activity deleted successfully'));
});

/**
 * Get all Alumni Directory Members
 */
export const getAlumniDirectory = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_members ORDER BY batch DESC, name ASC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Alumni directory fetched successfully'));
});

/**
 * Create or Update Alumni Directory Member
 */
export const handleDirectoryPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, batch, role, location, company, verified, linkedinUrl, email } = sanitizeObject(req.body);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);
  const isVerified = verified === 'true' || verified === true || verified === 1 || verified === '1';

  if (id === '0' || !id || id === 0) {
    if (!name || !batch || !role) {
      throw new ApiError(400, 'Name, Batch, and Role are required');
    }
    const newId = `MEM-${Date.now()}`;
    await pool.query(
      'INSERT INTO alumni_members (id, name, batch, role, location, company, imageUrl, verified, linkedinUrl, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, name, batch, role, location || '', company || '', imageUrl, isVerified ? 1 : 0, linkedinUrl || null, email || null]
    );
    const [newMem] = await pool.query('SELECT * FROM alumni_members WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newMem as any)[0], ['imageUrl']), 'Alumni member created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Alumni member not found');
    }
    await pool.query(
      'UPDATE alumni_members SET name = COALESCE(?, name), batch = COALESCE(?, batch), role = COALESCE(?, role), location = COALESCE(?, location), company = COALESCE(?, company), imageUrl = COALESCE(?, imageUrl), verified = ?, linkedinUrl = COALESCE(?, linkedinUrl), email = COALESCE(?, email), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, batch, role, location, company, imageUrl, isVerified ? 1 : 0, linkedinUrl, email, id]
    );
    const [updatedMem] = await pool.query('SELECT * FROM alumni_members WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedMem as any)[0], ['imageUrl']), 'Alumni member updated successfully'));
  }
});

/**
 * Delete Alumni Directory Member
 */
export const deleteDirectoryMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_members WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Alumni member not found');
  }
  res.json(ApiResponse.success(null, 'Alumni member deleted successfully'));
});

/**
 * Get all Alumni Executives
 */
export const getAlumniExecutives = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_executives ORDER BY sortOrder ASC, createdAt DESC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Alumni executives fetched successfully'));
});

/**
 * Create or Update Alumni Executive
 */
export const handleExecutivePost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, role, batch, quote, isHead, linkedinUrl, email, sortOrder } = sanitizeObject(req.body);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);
  const isExecutiveHead = isHead === 'true' || isHead === true || isHead === 1 || isHead === '1';

  if (id === '0' || !id || id === 0) {
    if (!name || !role || !batch) {
      throw new ApiError(400, 'Name, Role, and Batch are required');
    }
    const newId = `EXE-${Date.now()}`;
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : 99;
    await pool.query(
      'INSERT INTO alumni_executives (id, name, role, batch, imageUrl, quote, isHead, linkedinUrl, email, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, name, role, batch, imageUrl, quote || null, isExecutiveHead ? 1 : 0, linkedinUrl || null, email || null, nextSortOrder]
    );
    const [newExe] = await pool.query('SELECT * FROM alumni_executives WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newExe as any)[0], ['imageUrl']), 'Executive member created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_executives WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Executive member not found');
    }
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : (existing[0].sortOrder || 99);
    await pool.query(
      'UPDATE alumni_executives SET name = COALESCE(?, name), role = COALESCE(?, role), batch = COALESCE(?, batch), imageUrl = COALESCE(?, imageUrl), quote = COALESCE(?, quote), isHead = ?, linkedinUrl = COALESCE(?, linkedinUrl), email = COALESCE(?, email), sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, role, batch, imageUrl, quote, isExecutiveHead ? 1 : 0, linkedinUrl, email, nextSortOrder, id]
    );
    const [updatedExe] = await pool.query('SELECT * FROM alumni_executives WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedExe as any)[0], ['imageUrl']), 'Executive member updated successfully'));
  }
});

/**
 * Delete Alumni Executive
 */
export const deleteExecutive = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_executives WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Executive member not found');
  }
  res.json(ApiResponse.success(null, 'Executive member deleted successfully'));
});

/**
 * Get all Alumni Announcements
 */
export const getAlumniAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_announcements ORDER BY sortOrder ASC, date DESC');

  let filteredRows = rows as any[];
  if (!isAdminRequest(req)) {
    const todayStr = formatDateToYYYYMMDD(new Date())!;
    filteredRows = filteredRows.filter(ann => !ann.expiryDate || ann.expiryDate >= todayStr);
  }

  res.json(ApiResponse.success(filteredRows, 'Alumni announcements fetched successfully'));
});

/**
 * Create or Update Alumni Announcement
 */
export const handleAnnouncementPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, title, date, type, description, color, sortOrder, expiryDate } = sanitizeObject(req.body);

  if (id === '0' || !id || id === 0) {
    if (!title || !date || !type) {
      throw new ApiError(400, 'Title, Date, and Type are required');
    }
    const newId = `ANN-${Date.now()}`;
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : 99;
    await pool.query(
      'INSERT INTO alumni_announcements (id, title, date, type, description, color, sortOrder, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, title, date, type, description || null, color || 'blue', nextSortOrder, expiryDate || '2027-01-01']
    );
    const [newAnn] = await pool.query('SELECT * FROM alumni_announcements WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success((newAnn as any)[0], 'Announcement created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_announcements WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Announcement not found');
    }
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : (existing[0].sortOrder || 99);
    await pool.query(
      'UPDATE alumni_announcements SET title = COALESCE(?, title), date = COALESCE(?, date), type = COALESCE(?, type), description = COALESCE(?, description), color = COALESCE(?, color), sortOrder = ?, expiryDate = COALESCE(?, expiryDate), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title, date, type, description, color, nextSortOrder, expiryDate || null, id]
    );
    const [updatedAnn] = await pool.query('SELECT * FROM alumni_announcements WHERE id = ?', [id]);
    return res.json(ApiResponse.success((updatedAnn as any)[0], 'Announcement updated successfully'));
  }
});

/**
 * Delete Alumni Announcement
 */
export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_announcements WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Announcement not found');
  }
  res.json(ApiResponse.success(null, 'Announcement deleted successfully'));
});

/**
 * Get all Alumni News
 */
export const getAlumniNews = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_news ORDER BY sortOrder ASC, date DESC');

  let filteredRows = rows as any[];
  if (!isAdminRequest(req)) {
    const todayStr = formatDateToYYYYMMDD(new Date())!;
    filteredRows = filteredRows.filter(news => !news.expiryDate || news.expiryDate >= todayStr);
  }

  res.json(ApiResponse.success(formatDataUrls(filteredRows, ['imageUrl']), 'Alumni news fetched successfully'));
});

/**
 * Create or Update Alumni News Story
 */
export const handleNewsPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, title, date, author, description, sortOrder, expiryDate } = sanitizeObject(req.body);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0) {
    if (!title || !date || !author) {
      throw new ApiError(400, 'Title, Date, and Author are required');
    }
    const newId = `NWS-${Date.now()}`;
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : 99;
    await pool.query(
      'INSERT INTO alumni_news (id, title, date, author, description, imageUrl, sortOrder, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, title, date, author, description || null, imageUrl, nextSortOrder, expiryDate || '2027-01-01']
    );
    const [newNews] = await pool.query('SELECT * FROM alumni_news WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newNews as any)[0], ['imageUrl']), 'News story created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_news WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'News story not found');
    }
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : (existing[0].sortOrder || 99);
    await pool.query(
      'UPDATE alumni_news SET title = COALESCE(?, title), date = COALESCE(?, date), author = COALESCE(?, author), description = COALESCE(?, description), imageUrl = COALESCE(?, imageUrl), sortOrder = ?, expiryDate = COALESCE(?, expiryDate), updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [title, date, author, description, imageUrl, nextSortOrder, expiryDate || null, id]
    );
    const [updatedNews] = await pool.query('SELECT * FROM alumni_news WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedNews as any)[0], ['imageUrl']), 'News story updated successfully'));
  }
});

/**
 * Delete Alumni News Story
 */
export const deleteNews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_news WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'News story not found');
  }
  res.json(ApiResponse.success(null, 'News story deleted successfully'));
});

/**
 * Get all Alumni Committee Members
 */
export const getAlumniCommittee = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_committee_members ORDER BY sortOrder ASC, name ASC');
  res.json(ApiResponse.success(formatDataUrls(rows, ['imageUrl']), 'Alumni committee fetched successfully'));
});

/**
 * Create or Update Alumni Committee Member
 */
export const handleCommitteePost = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, designation, batch, location, linkedinUrl, email, sortOrder } = sanitizeObject(req.body);
  const imageUrl = req.file ? getUploadPath(req.file) : (req.body.imageUrl || null);

  if (id === '0' || !id || id === 0) {
    if (!name || !designation || !batch || !location) {
      throw new ApiError(400, 'Name, Designation, Batch, and Location are required');
    }
    const newId = `COM-${Date.now()}`;
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : 99;
    await pool.query(
      'INSERT INTO alumni_committee_members (id, name, designation, batch, location, imageUrl, linkedinUrl, email, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newId, name, designation, batch, location, imageUrl, linkedinUrl || null, email || null, nextSortOrder]
    );
    const [newMem] = await pool.query('SELECT * FROM alumni_committee_members WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success(formatDataUrls((newMem as any)[0], ['imageUrl']), 'Committee member created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_committee_members WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Committee member not found');
    }
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : (existing[0].sortOrder || 99);
    await pool.query(
      'UPDATE alumni_committee_members SET name = COALESCE(?, name), designation = COALESCE(?, designation), batch = COALESCE(?, batch), location = COALESCE(?, location), imageUrl = COALESCE(?, imageUrl), linkedinUrl = COALESCE(?, linkedinUrl), email = COALESCE(?, email), sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [name, designation, batch, location, imageUrl, linkedinUrl, email, nextSortOrder, id]
    );
    const [updatedMem] = await pool.query('SELECT * FROM alumni_committee_members WHERE id = ?', [id]);
    return res.json(ApiResponse.success(formatDataUrls((updatedMem as any)[0], ['imageUrl']), 'Committee member updated successfully'));
  }
});

/**
 * Delete Alumni Committee Member
 */
export const deleteCommitteeMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_committee_members WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Committee member not found');
  }
  res.json(ApiResponse.success(null, 'Committee member deleted successfully'));
});

/**
 * Get all Alumni Constitution Articles
 */
export const getAlumniConstitution = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM alumni_constitution_articles ORDER BY sortOrder ASC, sectionId ASC');
  res.json(ApiResponse.success(rows, 'Alumni constitution fetched successfully'));
});

/**
 * Create or Update Alumni Constitution Article
 */
export const handleConstitutionPost = asyncHandler(async (req: Request, res: Response) => {
  const { id, sectionId, title, icon, content, sortOrder } = sanitizeObject(req.body);

  if (id === '0' || !id || id === 0) {
    if (!sectionId || !title || !content) {
      throw new ApiError(400, 'Section ID, Title, and Content are required');
    }
    const newId = `ART-${Date.now()}`;
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : 99;
    await pool.query(
      'INSERT INTO alumni_constitution_articles (id, sectionId, title, icon, content, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
      [newId, sectionId, title, icon || 'FileText', content, nextSortOrder]
    );
    const [newArt] = await pool.query('SELECT * FROM alumni_constitution_articles WHERE id = ?', [newId]);
    return res.status(201).json(ApiResponse.success((newArt as any)[0], 'Constitution article created successfully'));
  } else {
    const [existing]: any = await pool.query('SELECT * FROM alumni_constitution_articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new ApiError(404, 'Constitution article not found');
    }
    const nextSortOrder = sortOrder !== undefined ? parseInt(sortOrder) : (existing[0].sortOrder || 99);
    await pool.query(
      'UPDATE alumni_constitution_articles SET sectionId = COALESCE(?, sectionId), title = COALESCE(?, title), icon = COALESCE(?, icon), content = COALESCE(?, content), sortOrder = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [sectionId, title, icon, content, nextSortOrder, id]
    );
    const [updatedArt] = await pool.query('SELECT * FROM alumni_constitution_articles WHERE id = ?', [id]);
    return res.json(ApiResponse.success((updatedArt as any)[0], 'Constitution article updated successfully'));
  }
});

/**
 * Delete Alumni Constitution Article
 */
export const deleteConstitutionArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM alumni_constitution_articles WHERE id = ?', [id]);
  if ((result as any).affectedRows === 0) {
    throw new ApiError(404, 'Constitution article not found');
  }
  res.json(ApiResponse.success(null, 'Constitution article deleted successfully'));
});

