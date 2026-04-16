import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import os from 'os';
import heroRoutes from './routes/heroRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import toppersRoutes from './routes/toppersRoutes.js';
import aqarRoutes from './routes/aqarRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import aboutRoutes from './routes/aboutRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to be loaded cross-origin
}));
app.use(cors({
  origin: (origin, callback) => {
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

    // If set to *, allow all origins
    if (corsOrigin === '*') {
      return callback(null, true);
    }

    const allowedOrigins = corsOrigin.split(',');
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Static Files
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/departments', departmentRoutes);

// Apply Auth Middleware to all subsequent API routes
app.use('/api', authMiddleware);

app.use('/api/hero', heroRoutes);
app.use('/api/hall-of-fame', toppersRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/aqars', aqarRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
