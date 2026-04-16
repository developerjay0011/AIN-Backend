import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
  try {
    console.log('⏳ Setting up database...');

    const tables = [
      'hero_slides',
      'achievements',
      'gallery_events',
      'gallery_media',
      'notices',
      'notice_links',
      'staff',
      'toppers',
      'aqars',
      'admins',
      'quality_metrics',
      'settings',
      'admission_inquiries',
      'contact_inquiries'
    ];

    for (const table of tables) {
      await pool.query(`DROP TABLE IF EXISTS ${table}`);
    }

    const createTablesQueries = [
      `CREATE TABLE IF NOT EXISTS hero_slides (
        id VARCHAR(255) PRIMARY KEY,
        imageUrl TEXT NOT NULL,
        link VARCHAR(255),
        \`order\` INT DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        tag VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100),
        category VARCHAR(100),
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS gallery_events (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        highlights TEXT,
        date VARCHAR(100),
        startTime VARCHAR(20),
        endTime VARCHAR(20),
        location VARCHAR(255),
        mainTag VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS gallery_media (
        id VARCHAR(255) PRIMARY KEY,
        eventId VARCHAR(255),
        type VARCHAR(20) NOT NULL,
        url TEXT NOT NULL,
        name VARCHAR(255),
        FOREIGN KEY (eventId) REFERENCES gallery_events(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS notices (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        date VARCHAR(100),
        type VARCHAR(100),
        description TEXT,
        critical BOOLEAN DEFAULT 0,
        imageUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS notice_links (
        id VARCHAR(255) PRIMARY KEY,
        noticeId VARCHAR(255),
        label VARCHAR(255),
        url TEXT,
        FOREIGN KEY (noticeId) REFERENCES notices(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        image TEXT,
        type VARCHAR(50) NOT NULL,
        qualification VARCHAR(255),
        experience VARCHAR(255),
        specialization VARCHAR(255),
        department VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS toppers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rankTag VARCHAR(255),
        rank VARCHAR(255),
        imageUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS aqars (
        id VARCHAR(255) PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        date VARCHAR(100),
        documentUrl TEXT,
        size VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS quality_metrics (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        icon VARCHAR(255) DEFAULT 'Award',
        color VARCHAR(255) DEFAULT 'bg-blue-50 text-blue-600',
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY,
        key_name VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        label VARCHAR(255),
        group_name VARCHAR(100),
        type VARCHAR(50) DEFAULT 'text',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS admission_inquiries (
        id VARCHAR(255) PRIMARY KEY,
        studentName VARCHAR(255) NOT NULL,
        parentName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        grade VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS contact_inquiries (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'New',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    // Note: SQLite doesn't support ENUM or ON UPDATE CURRENT_TIMESTAMP in simple CREATE TABLE
    // We stripped them for maximum compatibility.

    for (const query of createTablesQueries) {
      await pool.query(query);
    }
    console.log('✅ All tables ensured.');

    // Create default admin if none exists
    const [admins] = await pool.query('SELECT * FROM admins LIMIT 1');
    if ((admins as any[]).length === 0) {
      console.log('👤 No admin found. Creating default admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO admins (id, username, password) VALUES (?, ?, ?)',
        [Date.now().toString(), 'admin', hashedPassword]
      );
      console.log('✅ Default admin created: admin / admin123');
    }

    // Seed quality metrics if empty
    const [metrics] = await pool.query('SELECT * FROM quality_metrics LIMIT 1');
    if ((metrics as any[]).length === 0) {
      console.log('📊 Seeding initial quality metrics...');
      const initialMetrics = [
        { id: '1', title: 'Academic Excellence', value: 'Grade A', icon: 'Award', color: 'bg-emerald-50 text-emerald-600' },
        { id: '2', title: 'Compliance Rate', value: '100%', icon: 'ShieldCheck', color: 'bg-blue-50 text-blue-600' },
        { id: '3', title: 'Research Growth', value: '+24%', icon: 'TrendingUp', color: 'bg-gold/10 text-gold' }
      ];

      for (const m of initialMetrics) {
        await pool.query(
          'INSERT INTO quality_metrics (id, title, value, icon, color) VALUES (?, ?, ?, ?, ?)',
          [m.id, m.title, m.value, m.icon, m.color]
        );
      }
      console.log('✅ Initial quality metrics seeded.');
    }

    // Seed settings if empty
    const [settings] = await pool.query('SELECT * FROM settings LIMIT 1');
    if ((settings as any[]).length === 0) {
      console.log('⚙️ Seeding initial site settings...');
      const { initialSettings } = await import('../seeds/data/settings.js');

      for (const s of initialSettings) {
        const id = `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
          'INSERT INTO settings (id, key_name, value, label, group_name, type) VALUES (?, ?, ?, ?, ?, ?)',
          [id, s.key_name, s.value, s.label, s.group_name, s.type || 'text']
        );
      }
      console.log('✅ Initial site settings seeded.');
    }

    console.log('🚀 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
