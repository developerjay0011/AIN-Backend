import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.APP_URL || 'http://localhost:5001';

const formatSingleUrl = (path: string): string => {
  if (!path || path === '[object Object]') return '';
  let cleanPath = typeof path === 'string' ? path.replace(/http:\/\/localhost:5001/g, '') : '';
  if (cleanPath.startsWith('http')) return cleanPath;
  cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  return `${BASE_URL}${cleanPath}`;
};

/**
 * Ensures a file path is a complete URL by prepending the base URL if necessary.
 * Handles single string URLs, JSON array strings, and arrays of objects.
 */
export const formatFileUrl = (path: string | null | undefined): string => {
  if (!path || path === '[object Object]') return '';

  if (typeof path === 'string' && path.trim().startsWith('[') && path.trim().endsWith(']')) {
    try {
      const parsed = JSON.parse(path);
      if (Array.isArray(parsed)) {
        return JSON.stringify(parsed.map((p: any) => typeof p === 'string' ? formatSingleUrl(p) : p));
      }
    } catch { }
  }

  return formatSingleUrl(path);
};

/**
 * Safely extracts a string URL from an input that might be a string or an object.
 * Used for sanitizing incoming request bodies.
 */
export const ensureStringUrl = (input: any): string => {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    return input.url || input.path || input.imageUrl || input.image || '';
  }
  return '';
};

/**
 * Recursively scans an object or array and formats any strings that look like relative upload paths.
 * If keysToFormat is provided, only those specific keys will be formatted.
 * Otherwise, uses a heuristic based on key names and values.
 */
export const formatDataUrls = (data: any, keysToFormat?: string[]): any => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => formatDataUrls(item, keysToFormat));
  }

  // Only process plain objects, skip null and Date objects
  if (typeof data === 'object' && data !== null && !(data instanceof Date)) {
    const formatted: any = { ...data };
    for (const key in formatted) {
      const value = formatted[key];

      if (typeof value === 'string') {
        let shouldFormat = false;

        if (keysToFormat && keysToFormat.length > 0) {
          // If keys are provided, only format if the key is in the list
          shouldFormat = keysToFormat.includes(key);
        } else {
          // Fallback to heuristic for backward compatibility
          shouldFormat = (
            key.toLowerCase().includes('image') ||
            key.toLowerCase().includes('document') ||
            key.toLowerCase().includes('file') ||
            key.toLowerCase().includes('url') ||
            key.toLowerCase().includes('logo') ||
            key.toLowerCase().includes('icon') ||
            value.includes('/uploads/') ||
            value.includes('localhost:5001')
          );
        }

        if (shouldFormat) {
          formatted[key] = formatFileUrl(value);
        }
      } else if (typeof value === 'object') {
        formatted[key] = formatDataUrls(value, keysToFormat);
      }
    }
    return formatted;
  }

  return data;
};

/**
 * Common helper to format Multer file paths for consistency across controllers.
 * Handles both single files and potentially undefined files.
 */
export const getUploadPath = (file: Express.Multer.File | undefined | null): string | null => {
  if (!file || !file.path) return null;
  return `/${file.path.replace(/\\/g, '/')}`;
};

