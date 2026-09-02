import os from 'os';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
import heroRoutes from './routes/heroRoutes.js';
import aqarRoutes from './routes/aqarRoutes.js';
import authRoutes from './routes/authRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import awardsRoutes from './routes/awardsRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import toppersRoutes from './routes/toppersRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import programRoutes from './routes/programRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import researchRoutes from './routes/researchRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import recognitionsRoutes from './routes/recognitionsRoutes.js';
import publicationsRoutes from './routes/publicationsRoutes.js';

import express, { type Request, type Response } from 'express';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline for dev/specific animations if needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "*"], // Allow data/blob for CAPTCHA and * for dynamic uploads
      connectSrc: ["'self'", "*"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"], // Prevent clickjacking by restricting embedding completely
    },
  },
  frameguard: {
    action: 'deny', // Strict clickjacking protection
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
}));

// Permissions Policy Header Middleware
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  next();
});

// Block Mailman and Pipermail routes to prevent exposure of mailing list administration pages
app.use(['/mailman', '/cgi-bin/mailman', '/pipermail'], (req, res) => {
  res.status(403).json({ error: 'Access denied' });
});

app.use(cors({
  origin: (origin, callback) => {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:1001';

    // If set to *, allow all origins
    if (corsOrigin === '*') {
      return callback(null, true);
    }

    // Clean up origins (remove whitespace and trailing slashes)
    const allowedOrigins = corsOrigin.split(',').map(o => o.trim().replace(/\/$/, ''));

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Clean up request origin
    const requestOrigin = origin.trim().replace(/\/$/, '');

    if (!allowedOrigins.includes(requestOrigin)) {
      console.warn(`[CORS Blocked] Origin: ${requestOrigin} | Allowed: ${allowedOrigins.join(', ')}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Explicitly handle pre-flight requests (Removed due to Express 5 path-to-regexp changes; app.use(cors()) is sufficient)
app.use(morgan('dev'));
app.use(express.json());

// Trust the reverse proxy (crucial for cPanel/Apache/LiteSpeed) so rate limiters track real client IPs
app.set('trust proxy', 1);

// Rate Limiting
const isDev = process.env.NODE_ENV === 'development';

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isDev ? 10000 : 100, // limit each IP to 100 requests per windowMs in production
  skip: (req) => isDev || req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 5 minutes'
    });
  }
});

const inquiryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isDev ? 1000 : 5, // restrict public inquiry forms to 5 requests per 5 mins in production
  skip: (req) => isDev || req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many inquiry submissions from this IP, please try again after 5 minutes'
    });
  }
});

// app.use('/api/', apiLimiter);
// Apply inquiry limiter only to POST requests (submissions) to avoid blocking Admin GET requests
app.use('/api/inquiries', (req, res, next) => {
  if (req.method === 'POST') {
    return inquiryLimiter(req, res, next);
  }
  next();
});

// Static Files
// Block directory listing for uploads directory by rejecting access to directories
app.use('/uploads', (req, res, next) => {
  if (req.path === '/' || req.path === '' || req.path.endsWith('/')) {
    return res.status(403).json({ error: 'Directory listing is forbidden' });
  }
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'AIN Backend API is running' });
});

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', authMiddleware);
app.use('/api/auth', authRoutes);

app.use('/api/programs', programRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/hall-of-fame', toppersRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/aqars', aqarRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/recognitions', recognitionsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/publications', publicationsRoutes);


// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Get local network IP
const getLocalIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'unknown';
};

// Start Server
const server = app.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log(`🚀 Server is running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
});

/**
 * Graceful Shutdown Handling
 */
const gracefulShutdown = () => {
  console.log('🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });

  // Force shutdown after 10s if graceful fails
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcing shut down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
