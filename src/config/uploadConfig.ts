import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/videos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos');
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images');
    } else {
      cb(null, 'uploads/documents');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Restricted file types for security
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Expanded whitelist: allowed extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|doc|docx|mp4|heic|heif|avif|tiff/i;
  // NOTE: SVGs are excluded here for security (XSS risk) unless strictly necessary.
  
  const mimetype = allowedExtensions.test(file.mimetype);
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  // MUST match both for maximum security
  if (mimetype && extname) {
    return cb(null, true);
  }

  // Log specific failure details to help debug recurring upload issues
  console.error(`[UPLOAD REJECTED] Name: ${file.originalname}, Mime: ${file.mimetype}`);

  cb(new Error('Error: File upload only supports images, documents, and mp4 videos! (Security check failed)'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

