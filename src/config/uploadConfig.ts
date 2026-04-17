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
  // Expanded whitelist to include modern image formats and other necessary types
  const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|doc|docx|mp4|heic|heif|avif|svg|tiff/i;
  const mimetype = allowedExtensions.test(file.mimetype);
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  // Allow if either mimetype matches or if extension matches.
  // This supports browser Blobs and standard files with various casing/formats.
  if (mimetype || extname) {
    return cb(null, true);
  }

  // Log specific failure details to help debug recurring upload issues
  console.error(`[UPLOAD REJECTED] Name: ${file.originalname}, Mime: ${file.mimetype}`);

  cb(new Error('Error: File upload only supports images (including HEIC/AVIF), documents, and mp4 videos!'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 150 * 1024 * 1024 // 100MB limit
  }
});
