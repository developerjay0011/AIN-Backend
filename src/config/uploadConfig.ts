import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure base upload directories exist
const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/videos'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Global File Filter for security validation
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Expanded whitelist: allowed extensions
  const allowedExtensions = /jpeg|jpg|png|gif|webp|pdf|doc|docx|mp4|heic|heif|avif|tiff/i;
  
  const isMimeValid = allowedExtensions.test(file.mimetype);
  const extension = path.extname(file.originalname).toLowerCase();
  
  // Allow if Mime is valid AND (Extension is valid OR file is a nameless blob)
  if (isMimeValid && (extension === '' || allowedExtensions.test(extension))) {
    return cb(null, true);
  }

  // Log specific failure details to help debug recurring upload issues
  console.error(`[UPLOAD REJECTED] Name: ${file.originalname}, Mime: ${file.mimetype}`);
  cb(new Error('Error: File upload only supports images, documents, and mp4 videos! (Security check failed)'), false);
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
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      let ext = path.extname(file.originalname).toLowerCase();
      
      // If extension is missing (e.g. 'blob'), derive it from the MIME type
      if (!ext) {
        if (file.mimetype === 'image/jpeg') ext = '.jpg';
        else if (file.mimetype === 'image/png') ext = '.png';
        else if (file.mimetype === 'application/pdf') ext = '.pdf';
        else if (file.mimetype === 'video/mp4') ext = '.mp4';
        else if (file.mimetype === 'application/msword') ext = '.doc';
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ext = '.docx';
      }
      
      cb(null, uniqueSuffix + ext);
    }
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB limit
    }
  });
};

/**
 * Default generic upload instance for backward compatibility.
 * Saves to uploads/[type]/general/
 */
export const upload = categoryUpload('general');
