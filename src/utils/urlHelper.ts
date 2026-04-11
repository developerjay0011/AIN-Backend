import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.APP_URL || 'http://localhost:5001';

/**
 * Ensures a file path is a complete URL by prepending the base URL if necessary.
 * Handles both strings and arrays of objects with standard media keys.
 */
export const formatFileUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Ensure we don't double slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
};

/**
 * Recursively scans an object or array and formats any strings that look like relative upload paths.
 */
export const formatDataUrls = (data: any): any => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => formatDataUrls(item));
  }

  if (typeof data === 'object') {
    const formatted: any = { ...data };
    for (const key in formatted) {
      const value = formatted[key];
      
      // Check for common image/document keys or values that look like upload paths
      if (typeof value === 'string' && (
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('document') || 
        key.toLowerCase().includes('file') ||
        key.toLowerCase().includes('url') ||
        value.startsWith('/uploads/')
      )) {
        formatted[key] = formatFileUrl(value);
      } else if (typeof value === 'object') {
        formatted[key] = formatDataUrls(value);
      }
    }
    return formatted;
  }

  return data;
};
