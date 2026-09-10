import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure base upload directories exist
const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/videos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Strict mapping of allowed MIME types to their valid extensions
 */
const ALLOWED_MIME_MAP: Record<string, string[]> = {
  // Images (strictly raster/vector web safe; SVGs strictly excluded to prevent stored XSS / XML injection)
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/avif': ['.avif'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],

  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],

  // Videos
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov']
};

/**
 * Blacklist of dangerous extensions and executable file signatures
 */
const DANGEROUS_EXTENSIONS = /\.(php|phtml|php\d|jsp|jspx|asp|aspx|sh|bash|exe|bat|cmd|html|htm|xhtml|shtml|svg|xml|js|mjs|vbs|phar|pht|cgi|pl|py|htaccess|config|env|jar)(\.|$)/i;

/**
 * Global File Filter for security validation
 * Enforces:
 * 1. Whitelist-only extensions
 * 2. Strict MIME-type match
 * 3. Double-extension rejection (e.g. payload.svg.jpeg, shell.php.png)
 * 4. Null-byte and path-traversal prevention
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const originalName = file.originalname.trim();

  // 1. Prevent null bytes and path traversal in original file name
  if (originalName.includes('\0') || originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
    console.warn(`[UPLOAD BLOCKED] Path traversal / null byte attempt: ${originalName}`);
    return cb(new Error('Invalid filename detected (Security violation)'));
  }

  // 2. Reject if any part of the filename matches dangerous extensions (Double extension prevention)
  if (DANGEROUS_EXTENSIONS.test(originalName)) {
    console.warn(`[UPLOAD BLOCKED] Dangerous / double extension detected: ${originalName}`);
    return cb(new Error('File upload rejected: Executable or script extensions (including .svg, .php, .jsp, .html) are strictly prohibited.'));
  }

  // 3. Extract and check the final extension
  const ext = path.extname(originalName).toLowerCase();
  if (!ext) {
    console.warn(`[UPLOAD BLOCKED] Missing extension: ${originalName}`);
    return cb(new Error('File upload rejected: Files must have a valid extension.'));
  }

  // 4. Validate MIME Type against the strict whitelist map
  const validExtensionsForMime = ALLOWED_MIME_MAP[file.mimetype.toLowerCase()];
  if (!validExtensionsForMime || !validExtensionsForMime.includes(ext)) {
    console.warn(`[UPLOAD BLOCKED] Mismatched MIME (${file.mimetype}) vs Extension (${ext}) for: ${originalName}`);
    return cb(new Error('File upload rejected: Content type does not match the allowed file extension.'));
  }

  // 5. Additional check for multiple dots in the filename
  const parts = originalName.split('.');
  if (parts.length > 2) {
    // If multiple dots exist, verify none of the intermediate segments resemble an extension
    for (let i = 1; i < parts.length - 1; i++) {
      const segment = parts[i].toLowerCase();
      if (DANGEROUS_EXTENSIONS.test(`.${segment}.`) || DANGEROUS_EXTENSIONS.test(`.${segment}`)) {
        console.warn(`[UPLOAD BLOCKED] Multi-dot suspicious segment: ${originalName}`);
        return cb(new Error('File upload rejected: Double extensions are not permitted.'));
      }
    }
  }

  return cb(null, true);
};

/**
 * Categorized Upload Middleware Factory
 * Returns a configured multer instance that saves files to uploads/{type}/{category}
 */
export const categoryUpload = (category: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let type = 'documents';
      if (file.mimetype.startsWith('image/')) {
        type = 'images';
      } else if (file.mimetype.startsWith('video/')) {
        type = 'videos';
      }

      const dir = path.join('uploads', type, category);

      // Ensure directory exists dynamically as needed
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },
    filename: (req, file, cb) => {
      // Generate randomized, unguessable filename to prevent file overwrites or direct execution
      const randomKey = crypto.randomBytes(16).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomKey}${ext}`);
    }
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB maximum per file
      files: 20 // Maximum 20 files per upload batch
    }
  });
};

/**
 * Default generic upload instance for backward compatibility.
 * Saves to uploads/[type]/general/
 */
export const upload = categoryUpload('general');

