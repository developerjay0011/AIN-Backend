import pool from '../config/db.js';

const migrate = async () => {
  try {
    console.log('⏳ Starting database migration...');

    // 1. Ensure tables exist (using similar logic to setupDb but without DROP)
    const tables = {
      hero_slides: `
        CREATE TABLE IF NOT EXISTS hero_slides (
          id VARCHAR(255) PRIMARY KEY,
          imageUrl TEXT NOT NULL,
          link VARCHAR(255),
          \`order\` INT DEFAULT 0,
          isActive BOOLEAN DEFAULT 1,
          tag VARCHAR(100) DEFAULT 'main',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      achievements: `
        CREATE TABLE IF NOT EXISTS achievements (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          date VARCHAR(100),
          category VARCHAR(100),
          description TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      gallery_events: `
        CREATE TABLE IF NOT EXISTS gallery_events (
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
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      gallery_media: `
        CREATE TABLE IF NOT EXISTS gallery_media (
          id VARCHAR(255) PRIMARY KEY,
          eventId VARCHAR(255),
          type VARCHAR(20) NOT NULL,
          url TEXT NOT NULL,
          name VARCHAR(255),
          FOREIGN KEY (eventId) REFERENCES gallery_events(id) ON DELETE CASCADE
        )`,
      notices: `
        CREATE TABLE IF NOT EXISTS notices (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          date VARCHAR(100),
          type VARCHAR(100),
          description TEXT,
          critical BOOLEAN DEFAULT 0,
          imageUrl TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      notice_links: `
        CREATE TABLE IF NOT EXISTS notice_links (
          id VARCHAR(255) PRIMARY KEY,
          noticeId VARCHAR(255),
          label VARCHAR(255),
          url TEXT,
          FOREIGN KEY (noticeId) REFERENCES notices(id) ON DELETE CASCADE
        )`,
      staff: `
        CREATE TABLE IF NOT EXISTS staff (
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
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      toppers: `
        CREATE TABLE IF NOT EXISTS toppers (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          rankTag VARCHAR(255),
          rank VARCHAR(255),
          imageUrl TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      aqars: `
        CREATE TABLE IF NOT EXISTS aqars (
          id VARCHAR(255) PRIMARY KEY,
          year VARCHAR(20) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'Pending',
          date VARCHAR(100),
          documentUrl TEXT,
          size VARCHAR(50),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      admins: `
        CREATE TABLE IF NOT EXISTS admins (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
      quality_metrics: `
        CREATE TABLE IF NOT EXISTS quality_metrics (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          value VARCHAR(255) NOT NULL,
          icon VARCHAR(255) DEFAULT 'Award',
          color VARCHAR(255) DEFAULT 'bg-blue-50 text-blue-600',
          sortOrder INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      settings: `
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(255) PRIMARY KEY,
          key_name VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          label VARCHAR(255),
          group_name VARCHAR(100),
          type VARCHAR(50) DEFAULT 'text',
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      admission_inquiries: `
        CREATE TABLE IF NOT EXISTS admission_inquiries (
          id VARCHAR(255) PRIMARY KEY,
          studentName VARCHAR(255) NOT NULL,
          parentName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          grade VARCHAR(100) NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'Pending',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      contact_inquiries: `
        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id VARCHAR(255) PRIMARY KEY,
          fullName VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'New',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      alumni_milestones: `
        CREATE TABLE IF NOT EXISTS alumni_milestones (
          id VARCHAR(255) PRIMARY KEY,
          year VARCHAR(20) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          imageUrl TEXT,
          sortOrder INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      departments: `
        CREATE TABLE IF NOT EXISTS departments (
          id VARCHAR(255) PRIMARY KEY,
          departmentId VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          shortName VARCHAR(100) NOT NULL,
          overview TEXT,
          areas TEXT,
          faculty INT DEFAULT 0,
          clinicalHours VARCHAR(255),
          sortOrder INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
    };

    for (const [name, query] of Object.entries(tables)) {
      await pool.query(query);
      // console.log(`✓ Table checked: ${name}`);
    }

    // 2. Incremental Migrations (Adding missing columns safely)
    const migrations = [
      // departments table
      { table: 'departments', column: 'departmentId', query: 'ALTER TABLE departments ADD COLUMN departmentId VARCHAR(255) UNIQUE AFTER id' },
      { table: 'departments', column: 'shortName', query: 'ALTER TABLE departments ADD COLUMN shortName VARCHAR(100) AFTER name' },
      { table: 'departments', column: 'sortOrder', query: 'ALTER TABLE departments ADD COLUMN sortOrder INT DEFAULT 0 AFTER clinicalHours' },
      
      // hero_slides table
      { table: 'hero_slides', column: 'title', query: 'ALTER TABLE hero_slides ADD COLUMN title VARCHAR(255) DEFAULT \'\' AFTER id' },
      { table: 'hero_slides', column: 'subtitle', query: 'ALTER TABLE hero_slides ADD COLUMN subtitle VARCHAR(255) DEFAULT \'\' AFTER title' },
      { table: 'hero_slides', column: 'tag', query: 'ALTER TABLE hero_slides ADD COLUMN tag VARCHAR(100) DEFAULT \'main\' AFTER isActive' },
    ];

    for (const m of migrations) {
      try {
        // Check if column exists
        const [columns]: any = await pool.query(`SHOW COLUMNS FROM ${m.table} LIKE ?`, [m.column]);
        if (columns.length === 0) {
          console.log(`⏳ Adding missing column '${m.column}' to table '${m.table}'...`);
          await pool.query(m.query);
          console.log(`✅ Column '${m.column}' added.`);
        }
      } catch (colErr: any) {
        // Ignore if already exists (MySQL 1060 error) or other common issues
        if (colErr.errno !== 1060) {
          console.warn(`⚠️  Could not add column ${m.column} to ${m.table}:`, colErr.message);
        }
      }
    }

    console.log('🚀 Database migration complete!');
    process.exit(0);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.errno === -61) {
      console.error('❌ Could not connect to MySQL. Is it running?');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('❌ MySQL Access Denied. Check your DB_USER and DB_PASSWORD in .env');
    } else {
      console.error('❌ Migration failed:', error);
    }
    process.exit(1);
  }
};

migrate();
