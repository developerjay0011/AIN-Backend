import pool from '../config/db.js';
import { Request, Response } from 'express';
import { sanitizeString } from '../utils/sanitize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import { formatDataUrls, getUploadPath } from '../utils/urlHelper.js';

// Deep sanitization helper
const sanitizeDeep = (val: any): any => {
  if (Array.isArray(val)) return val.map(sanitizeDeep);
  if (val && typeof val === 'object') {
    const result: any = {};
    for (const k of Object.keys(val)) result[k] = sanitizeDeep(val[k]);
    return result;
  }
  return typeof val === 'string' ? sanitizeString(val) : val;
};

// --- Unified Getter for All Facilities Data ---
export const getFacilitiesData = asyncHandler(async (req: Request, res: Response) => {
  // Query all four tables concurrently
  const [campusRows] = await pool.query('SELECT * FROM campus_facilities');
  const [hostelRows] = await pool.query('SELECT * FROM hostel_details WHERE id = ?', ['hostel']);
  const [snaRows] = await pool.query('SELECT * FROM sna_details WHERE id = ?', ['sna']);
  const [supportRows] = await pool.query('SELECT * FROM student_supports');

  // Format Campus
  const campusFormatted = (campusRows as any[]).map(row => ({
    ...row,
    features: row.features ? JSON.parse(row.features) : []
  }));

  // Format Hostel
  let hostelFormatted = null;
  if ((hostelRows as any[]).length > 0) {
    const row = (hostelRows as any[])[0];
    hostelFormatted = {
      ...row,
      amenities: row.amenities ? JSON.parse(row.amenities) : []
    };
  }

  // Format SNA
  let snaFormatted = null;
  if ((snaRows as any[]).length > 0) {
    const row = (snaRows as any[])[0];
    snaFormatted = {
      ...row,
      objectives: row.objectives ? JSON.parse(row.objectives) : [],
      executiveCommittee: row.executiveCommittee ? JSON.parse(row.executiveCommittee) : [],
      functionalCommittees: row.functionalCommittees ? JSON.parse(row.functionalCommittees) : [],
      annualEvents: row.annualEvents ? JSON.parse(row.annualEvents) : []
    };
  }

  const result = {
    campus: formatDataUrls(campusFormatted, ['image']),
    hostel: hostelFormatted ? formatDataUrls(hostelFormatted, ['ruleBookPdf']) : null,
    sna: snaFormatted,
    support: supportRows
  };

  res.json(ApiResponse.success(result, 'Facilities data fetched successfully'));
});

// --- Campus Facilities Update ---
export const updateCampusFacility = asyncHandler(async (req: Request, res: Response) => {
  const { id, title, description, image, features, delete: deleteFlag } = req.body;
  if (!id) throw new ApiError(400, 'Facility ID is required');

  if (deleteFlag === true) {
    await pool.query('DELETE FROM campus_facilities WHERE id = ?', [id]);
    res.json(ApiResponse.success(null, 'Campus facility removed successfully'));
    return;
  }

  const sanitizedTitle = title ? sanitizeString(title) : '';
  const sanitizedDesc = description ? sanitizeString(description) : '';
  const finalFeatures = features ? JSON.stringify(sanitizeDeep(features)) : null;

  const [existing]: any = await pool.query('SELECT id FROM campus_facilities WHERE id = ?', [id]);
  if (existing.length === 0) {
    await pool.query(
      'INSERT INTO campus_facilities (id, title, description, image, features) VALUES (?, ?, ?, ?, ?)',
      [id, sanitizedTitle, sanitizedDesc, image || null, finalFeatures]
    );
  } else {
    await pool.query(
      `UPDATE campus_facilities 
       SET title = ?, 
           description = ?, 
           image = COALESCE(?, image), 
           features = ? 
       WHERE id = ?`,
      [sanitizedTitle, sanitizedDesc, image || null, finalFeatures, id]
    );
  }
  res.json(ApiResponse.success(null, 'Campus facility updated successfully'));
});

// --- Hostel Details Update ---
export const updateHostelDetails = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, amenities, wardenName, wardenPhone, ruleBookPdf } = req.body;
  const sanitizedTitle = title ? sanitizeString(title) : '';
  const sanitizedDesc = description ? sanitizeString(description) : '';
  const finalAmenities = amenities ? JSON.stringify(sanitizeDeep(amenities)) : null;

  const [existing]: any = await pool.query('SELECT id FROM hostel_details WHERE id = ?', ['hostel']);
  if (existing.length === 0) {
    await pool.query(
      'INSERT INTO hostel_details (id, title, description, amenities, wardenName, wardenPhone, ruleBookPdf) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['hostel', sanitizedTitle, sanitizedDesc, finalAmenities, wardenName || null, wardenPhone || null, ruleBookPdf || null]
    );
  } else {
    await pool.query(
      `UPDATE hostel_details 
       SET title = ?, 
           description = ?, 
           amenities = ?, 
           wardenName = ?, 
           wardenPhone = ?, 
           ruleBookPdf = COALESCE(?, ruleBookPdf) 
       WHERE id = ?`,
      [sanitizedTitle, sanitizedDesc, finalAmenities, wardenName || null, wardenPhone || null, ruleBookPdf || null, 'hostel']
    );
  }
  res.json(ApiResponse.success(null, 'Hostel details updated successfully'));
});

// --- SNA Details Update ---
export const updateSnaDetails = asyncHandler(async (req: Request, res: Response) => {
  const { objectives, executiveCommittee, functionalCommittees, annualEvents } = req.body;

  const finalObjectives = objectives ? JSON.stringify(sanitizeDeep(objectives)) : null;
  const finalExec = executiveCommittee ? JSON.stringify(sanitizeDeep(executiveCommittee)) : null;
  const finalFunc = functionalCommittees ? JSON.stringify(sanitizeDeep(functionalCommittees)) : null;
  const finalEvents = annualEvents ? JSON.stringify(sanitizeDeep(annualEvents)) : null;

  const [existing]: any = await pool.query('SELECT id FROM sna_details WHERE id = ?', ['sna']);
  if (existing.length === 0) {
    await pool.query(
      'INSERT INTO sna_details (id, objectives, executiveCommittee, functionalCommittees, annualEvents) VALUES (?, ?, ?, ?, ?)',
      ['sna', finalObjectives, finalExec, finalFunc, finalEvents]
    );
  } else {
    await pool.query(
      `UPDATE sna_details 
       SET objectives = ?, 
           executiveCommittee = ?, 
           functionalCommittees = ?, 
           annualEvents = ? 
       WHERE id = ?`,
      [finalObjectives, finalExec, finalFunc, finalEvents, 'sna']
    );
  }
  res.json(ApiResponse.success(null, 'SNA details updated successfully'));
});

// --- Student Support Update ---
export const updateStudentSupport = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, description, icon, color, iconBg, iconColor, delete: deleteFlag } = req.body;
  if (!id) throw new ApiError(400, 'Student support ID is required');

  if (deleteFlag === true) {
    await pool.query('DELETE FROM student_supports WHERE id = ?', [id]);
    res.json(ApiResponse.success(null, 'Student support removed successfully'));
    return;
  }

  const sanitizedName = name ? sanitizeString(name) : '';
  const sanitizedDesc = description ? sanitizeString(description) : '';

  const [existing]: any = await pool.query('SELECT id FROM student_supports WHERE id = ?', [id]);
  if (existing.length === 0) {
    await pool.query(
      'INSERT INTO student_supports (id, name, description, icon, color, iconBg, iconColor) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, sanitizedName, sanitizedDesc, icon || null, color || null, iconBg || null, iconColor || null]
    );
  } else {
    await pool.query(
      `UPDATE student_supports 
       SET name = ?, 
           description = ?, 
           icon = ?, 
           color = ?, 
           iconBg = ?, 
           iconColor = ? 
       WHERE id = ?`,
      [sanitizedName, sanitizedDesc, icon || null, color || null, iconBg || null, iconColor || null, id]
    );
  }
  res.json(ApiResponse.success(null, 'Student support updated successfully'));
});

// --- Generic File Upload ---
export const uploadFacilityFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a file');
  }

  const fileUrl = getUploadPath(req.file);

  res.json(ApiResponse.success({ url: fileUrl }, 'File uploaded successfully'));
});
