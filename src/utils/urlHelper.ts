import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.APP_URL || 'http://localhost:5001';

/**
 * Ensures a file path is a complete URL by prepending the base URL if necessary.
 * Handles both strings and arrays of objects with standard media keys.
 */
export const formatFileUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // If the path contains localhost:5001, strip it to make it relative
  let cleanPath = path.replace(/http:\/\/localhost:5001/g, '');
  
  if (cleanPath.startsWith('http')) return cleanPath;
  
  // Ensure we don't double slash
  cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
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
        key.toLowerCase().includes('logo') ||
        key.toLowerCase().includes('icon') ||
        value.includes('/uploads/') ||
        value.includes('localhost:5001')
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
