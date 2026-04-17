import pool from '../config/db.js';
import { sanitizeString } from '../utils/sanitize.js';
import { formatDataUrls } from '../utils/urlHelper.js';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getAllSettings = asyncHandler(async (req: Request, res: Response) => {
  const [rows] = await pool.query('SELECT * FROM settings ORDER BY group_name, label');

  // Format settings into a key-value object grouped by section if needed, 
  // or just return as a flat list. For complexity, we'll return both.
  const settingsMap: Record<string, any> = {};
  (rows as any[]).forEach(row => {
    let value = row.value;
    if (row.type === 'json') {
      try {
        value = JSON.parse(row.value);
      } catch (e) {
        value = row.value;
      }
    }
    settingsMap[row.key_name] = value;
  });

  const formattedRows = formatDataUrls(rows);
  const formattedMap = formatDataUrls(settingsMap);

  res.json(ApiResponse.success({
    list: formattedRows,
    map: formattedMap
  }, 'Settings fetched successfully'));
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const { settings } = req.body; // Expecting { key: value }

  if (!settings || typeof settings !== 'object') {
    throw new ApiError(400, 'Invalid settings data provided');
  }

  // Deep sanitize the settings since some are JSON
  const sanitizeDeep = (val: any): any => {
    if (Array.isArray(val)) return val.map(sanitizeDeep);
    if (val && typeof val === 'object') {
      const result: any = {};
      for (const k of Object.keys(val)) result[k] = sanitizeDeep(val[k]);
      return result;
    }
    return typeof val === 'string' ? sanitizeString(val) : val;
  };

  const sanitizedSettings = sanitizeDeep(settings);

  const entries = Object.entries(sanitizedSettings);

  for (const [key, value] of entries) {
    // For JSON types, we want to perform a merge to preserve images/logos if omitted
    const [existingRows]: any = await pool.query('SELECT type, value FROM settings WHERE key_name = ?', [key]);
    let stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (existingRows.length > 0 && existingRows[0].type === 'json') {
        try {
            const existingData = JSON.parse(existingRows[0].value);
            const incomingData = value;

            if (Array.isArray(existingData) && Array.isArray(incomingData)) {
                // Merge arrays based on index or just preserve logos
                const merged = incomingData.map((item, idx) => {
                    const old = existingData[idx];
                    if (!old) return item;
                    return {
                        ...old,
                        ...item,
                        // Preserve logo if incoming is missing it
                        logo: item.logo || old.logo || null
                    };
                });
                stringValue = JSON.stringify(merged);
            } else if (typeof existingData === 'object' && typeof incomingData === 'object') {
                stringValue = JSON.stringify({ ...existingData, ...incomingData });
            }
        } catch (e) {
            console.error(`Error merging JSON setting for ${key}:`, e);
        }
    }

    await pool.query(
      'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
      [stringValue, key]
    );
  }

  res.json(ApiResponse.success(null, 'Settings updated successfully'));
});

export const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a logo image');
  }

  const { key_name, index } = req.body;
  const fileUrl = `/uploads/images/${req.file.filename}`; // Store relative path for portability
  const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

  if (key_name) {
    // Fetch current setting to see if it's a list or simple value
    const [rows]: any = await pool.query('SELECT * FROM settings WHERE key_name = ?', [key_name]);

    if (rows.length > 0) {
      const setting = rows[0];
      let newValue: any = fileUrl;

      if (setting.type === 'json' && index !== undefined) {
        try {
          const currentList = JSON.parse(setting.value);
          if (Array.isArray(currentList) && currentList[parseInt(index)]) {
            currentList[parseInt(index)].logo = fileUrl;
            newValue = JSON.stringify(currentList);
          } else {
            newValue = setting.value; // Fallback if index out of bounds
          }
        } catch (e) {
          console.error('Error parsing JSON setting:', e);
        }
      }

      await pool.query(
        'UPDATE settings SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key_name = ?',
        [newValue, key_name]
      );
    }
  }

  res.json(ApiResponse.success({ url: fullUrl }, 'Logo uploaded and registered successfully'));
});
