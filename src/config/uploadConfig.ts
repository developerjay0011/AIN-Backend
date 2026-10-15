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
 * Whitelist of strictly permitted file extensions
 */
const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.heic', '.heif',
  '.pdf', '.doc', '.docx',
  '.mp4', '.webm', '.mov'
]);

/**
 * Strict mapping of allowed MIME types to their valid extensions
 */
const ALLOWED_MIME_MAP: Record<string, string[]> = {
  // Images (SVG is strictly forbidden to prevent stored XSS)
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

const DANGEROUS_EXTENSIONS = new Set([
  'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps', 'pht', 'phar',
  'jsp', 'jspx', 'jsw', 'jsv',
  'asp', 'aspx', 'axd', 'ashx', 'asmx',
  'sh', 'bash', 'zsh', 'exe', 'bat', 'cmd', 'com', 'scr', 'vbs', 'vbe',
  'html', 'htm', 'xhtml', 'shtml', 'svg', 'xml', 'js', 'mjs', 'cjs',
  'cgi', 'pl', 'py', 'pyc', 'pyo', 'htaccess', 'htpasswd', 'config', 'env', 'jar'
]);

/**
 * Global File Filter for security validation
 * Enforces:
 * 1. Single-extension / harmless multi-dot limits (bans dangerous double extensions like payload.svg.jpeg, shell.php.png)
 * 2. Whitelist-only extensions (.jpg, .png, .pdf, etc.)
 * 3. Strict MIME-type to extension matching
 * 4. Dangerous script pattern rejection for intermediate and final extensions
 * 5. Null-byte and path-traversal prevention
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const originalName = file.originalname.trim();

  // 1. Prevent null bytes and path traversal in original file name
  if (originalName.includes('\0') || originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
    console.warn(`[UPLOAD BLOCKED] Path traversal / null byte attempt: ${originalName}`);
    return cb(new Error('Invalid filename detected (Security violation)'));
  }

  // 2. Extract parts and check intermediate extension parts for executable script spoofing
  const parts = originalName.split('.');
  if (parts.length < 2) {
    console.warn(`[UPLOAD BLOCKED] No extension: ${originalName}`);
    return cb(new Error('File upload rejected: Missing file extension.'));
  }

  const intermediateParts = parts.slice(1, -1);
  for (const intermediate of intermediateParts) {
    if (DANGEROUS_EXTENSIONS.has(intermediate.toLowerCase())) {
      console.warn(`[UPLOAD BLOCKED] Dangerous intermediate extension: ${originalName} (.${intermediate})`);
      return cb(new Error(`File upload rejected: Double extensions containing script format (.${intermediate}) are strictly prohibited.`));
    }
  }

  // 3. Extract and validate final extension against whitelist
  const ext = path.extname(originalName).toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    console.warn(`[UPLOAD BLOCKED] Non-whitelisted extension: ${originalName} (${ext})`);
    return cb(new Error(`File upload rejected: Extension '${ext}' is not permitted.`));
  }

  // 5. Validate MIME Type against the strict whitelist map
  const validExtensionsForMime = ALLOWED_MIME_MAP[file.mimetype.toLowerCase()];
  if (!validExtensionsForMime || !validExtensionsForMime.includes(ext)) {
    console.warn(`[UPLOAD BLOCKED] Mismatched MIME (${file.mimetype}) vs Extension (${ext}) for: ${originalName}`);
    return cb(new Error('File upload rejected: Content type does not match the allowed file extension.'));
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
