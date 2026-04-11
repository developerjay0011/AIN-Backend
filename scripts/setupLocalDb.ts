import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(process.cwd(), 'ain_local.db');
console.log(`🚀 Initializing SQLite (Node Native) at: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// Create tables only if they don't already exist — never drops existing data
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    type TEXT,
    critical INTEGER DEFAULT 0,
    image_url TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notice_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    noticeId TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (noticeId) REFERENCES notices (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    type TEXT NOT NULL,
    image TEXT,
    qualification TEXT,
    experience TEXT,
    specialization TEXT,
    department TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS gallery_events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT,
    startTime TEXT,
    endTime TEXT,
    location TEXT,
    mainTag TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS gallery_media (
    id TEXT PRIMARY KEY,
    eventId TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    name TEXT,
    FOREIGN KEY (eventId) REFERENCES gallery_events (id) ON DELETE CASCADE
  );
`);

// Seed Admin only if no admin account exists yet
const existingAdmins = db.prepare('SELECT COUNT(*) as count FROM admins').get() as { count: number };
if (existingAdmins.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const insertAdmin = db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)');
  insertAdmin.run('admin', hashedPassword);
  console.log('👤 Admin account created: admin / admin123');
} else {
  console.log('👤 Admin account already exists, skipping seed.');
}
console.log('✅ Local SQLite Database initialized (existing data preserved).');
db.close();
