import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const setupDatabase = async () => {
  try {
    console.log('⏳ Setting up database...');

    const tablesToDrop = [
      'recognitions',
      'recognition_types',
      'awards',
      'award_types',
      'gallery_media',
      'gallery_albums',
      'notice_links',
      'notices',
      'hero_slides',
      'achievements',
      'staff',
      'toppers',
      'aqars',
      'admins',
      'quality_metrics',
      'settings',
      'admission_inquiries',
      'contact_inquiries',
      'alumni_milestones',
      'departments',
      'administration_members',
      'alumni_activities',
      'alumni_members',
      'alumni_executives',
      'alumni_announcements',
      'alumni_news',
      'alumni_committee_members',
      'alumni_constitution_articles',
      'placement_members',
      'placement_stats',
      'placement_highlights',
      'placement_collaborations',
      'placement_resources',
      'courses',
      'programs',
      'campus_facilities',
      'hostel_details',
      'sna_details',
      'student_supports'
    ];

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of tablesToDrop) {
      await pool.query(`DROP TABLE IF EXISTS ${table}`);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    const createTablesQueries = [
      `CREATE TABLE IF NOT EXISTS hero_slides (
        id VARCHAR(255) PRIMARY KEY,
        imageUrl TEXT NOT NULL,
        \`order\` INT DEFAULT 0,
        tag VARCHAR(100) DEFAULT 'main',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100),
        category VARCHAR(100),
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date VARCHAR(100),
        startTime VARCHAR(20),
        endTime VARCHAR(20),
        location VARCHAR(255),
        mainTag VARCHAR(100),
        highlights TEXT,
        coverImage TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS gallery_albums (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        coverImage TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS gallery_media (
        id VARCHAR(255) PRIMARY KEY,
        albumId VARCHAR(255),
        type VARCHAR(20) NOT NULL,
        url TEXT NOT NULL,
        name VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (albumId) REFERENCES gallery_albums(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS notices (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        date VARCHAR(100),
        type VARCHAR(100),
        description TEXT,
        critical BOOLEAN DEFAULT 0,
        expiryDate VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS notice_links (
        id VARCHAR(255) PRIMARY KEY,
        noticeId VARCHAR(255),
        label VARCHAR(255),
        url TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (noticeId) REFERENCES notices(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS staff (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        image TEXT,
        type VARCHAR(50) NOT NULL,
        qualification VARCHAR(255),
        experience VARCHAR(255),
        specialization VARCHAR(255),
        department VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS toppers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rankTag VARCHAR(255),
        \`rank\` VARCHAR(255),
        imageUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS aqars (
        id VARCHAR(255) PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        date VARCHAR(100),
        documentUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS quality_metrics (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        icon VARCHAR(255) DEFAULT 'Award',
        color VARCHAR(255) DEFAULT 'bg-blue-50 text-blue-600',
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY,
        key_name VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        label VARCHAR(255),
        group_name VARCHAR(100),
        type VARCHAR(50) DEFAULT 'text',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
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
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS contact_inquiries (
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
      `CREATE TABLE IF NOT EXISTS alumni_milestones (
        id VARCHAR(255) PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl TEXT,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(255) PRIMARY KEY,
        departmentId VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        shortName VARCHAR(100) NOT NULL,
        overview TEXT,
        areas TEXT,
        faculty INT DEFAULT 0,
        clinicalHours VARCHAR(255),
        hod VARCHAR(255),
        facilities TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS administration_members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        section VARCHAR(50) DEFAULT 'director',
        role VARCHAR(255),
        imageUrl TEXT,
        qualification VARCHAR(255),
        experience VARCHAR(255),
        specialization VARCHAR(255),
        quote TEXT,
        description TEXT,
        sortOrder INT DEFAULT 0,
        isLinked BOOLEAN DEFAULT 0,
        staffId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_activities (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100),
        description TEXT,
        imageUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        batch VARCHAR(50) NOT NULL,
        role VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        imageUrl TEXT,
        verified BOOLEAN DEFAULT 0,
        linkedinUrl VARCHAR(255),
        email VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_executives (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        batch VARCHAR(50) NOT NULL,
        imageUrl TEXT,
        quote TEXT,
        isHead BOOLEAN DEFAULT 0,
        linkedinUrl VARCHAR(255),
        email VARCHAR(255),
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_announcements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        date VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(50) DEFAULT 'blue',
        sortOrder INT DEFAULT 0,
        expiryDate VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_news (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        date VARCHAR(100) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl TEXT,
        sortOrder INT DEFAULT 0,
        expiryDate VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_committee_members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        batch VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        imageUrl TEXT,
        linkedinUrl VARCHAR(255),
        email VARCHAR(255),
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS alumni_constitution_articles (
        id VARCHAR(255) PRIMARY KEY,
        sectionId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        icon VARCHAR(100) DEFAULT 'FileText',
        content TEXT NOT NULL,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS placement_members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        imageUrl TEXT,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS placement_stats (
        id VARCHAR(255) PRIMARY KEY,
        year VARCHAR(100) NOT NULL,
        hospitalsCount INT DEFAULT 0,
        eligibleStudents INT DEFAULT 0,
        placedStudents INT DEFAULT 0,
        higherStudies INT DEFAULT 0,
        placementPercentage DECIMAL(5,2) DEFAULT 0.00,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS placement_highlights (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(100) DEFAULT 'general',
        text TEXT NOT NULL,
        sortOrder INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS placement_collaborations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logoUrl TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS placement_resources (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        fileUrl TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        year INT DEFAULT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS programs (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        programId VARCHAR(255) NOT NULL,
        image TEXT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS campus_facilities (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT,
        features TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS hostel_details (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        amenities TEXT,
        wardenName VARCHAR(255),
        wardenPhone VARCHAR(255),
        ruleBookPdf TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS sna_details (
        id VARCHAR(255) PRIMARY KEY,
        objectives TEXT,
        executiveCommittee TEXT,
        functionalCommittees TEXT,
        annualEvents TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS student_supports (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        color VARCHAR(255),
        iconBg VARCHAR(255),
        iconColor VARCHAR(255)
      )`,
      `CREATE TABLE IF NOT EXISTS award_types (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS awards (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        details TEXT,
        image TEXT,
        awardTypeId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (awardTypeId) REFERENCES award_types(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS recognition_types (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS recognitions (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        details TEXT,
        image TEXT,
        recognitionTypeId VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recognitionTypeId) REFERENCES recognition_types(id) ON DELETE SET NULL
      )`
    ];

    for (const query of createTablesQueries) {
      let finalQuery = query.trim();
      if (!finalQuery.includes('CHARACTER SET') && !finalQuery.includes('COLLATE')) {
        finalQuery += ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci';
      }
      await pool.query(finalQuery);
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

    // Seed campus facilities if empty
    const [campusFacs] = await pool.query('SELECT * FROM campus_facilities LIMIT 1');
    if ((campusFacs as any[]).length === 0) {
      console.log('🏫 Seeding initial campus facilities...');
      const { initialCampusFacilities } = await import('../seeds/data/facilities.js');
      for (const f of initialCampusFacilities) {
        await pool.query(
          'INSERT INTO campus_facilities (id, title, description, image, features) VALUES (?, ?, ?, ?, ?)',
          [f.id, f.title, f.description, f.image || null, f.features ? JSON.stringify(f.features) : null]
        );
      }
      console.log('✅ Initial campus facilities seeded.');
    }

    // Seed hostel details if empty
    const [hostelDets] = await pool.query('SELECT * FROM hostel_details LIMIT 1');
    if ((hostelDets as any[]).length === 0) {
      console.log('🏠 Seeding initial hostel details...');
      const { initialHostelDetails } = await import('../seeds/data/facilities.js');
      for (const h of initialHostelDetails) {
        await pool.query(
          'INSERT INTO hostel_details (id, title, description, amenities, wardenName, wardenPhone, ruleBookPdf) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [h.id, h.title, h.description, h.amenities ? JSON.stringify(h.amenities) : null, h.wardenName || null, h.wardenPhone || null, h.ruleBookPdf || null]
        );
      }
      console.log('✅ Initial hostel details seeded.');
    }

    // Seed SNA details if empty
    const [snaDets] = await pool.query('SELECT * FROM sna_details LIMIT 1');
    if ((snaDets as any[]).length === 0) {
      console.log('🎗️ Seeding initial SNA details...');
      const { initialSnaDetails } = await import('../seeds/data/facilities.js');
      for (const s of initialSnaDetails) {
        await pool.query(
          'INSERT INTO sna_details (id, objectives, executiveCommittee, functionalCommittees, annualEvents) VALUES (?, ?, ?, ?, ?)',
          [s.id, s.objectives ? JSON.stringify(s.objectives) : null, s.executiveCommittee ? JSON.stringify(s.executiveCommittee) : null, s.functionalCommittees ? JSON.stringify(s.functionalCommittees) : null, s.annualEvents ? JSON.stringify(s.annualEvents) : null]
        );
      }
      console.log('✅ Initial SNA details seeded.');
    }

    // Seed student supports if empty
    const [studSupports] = await pool.query('SELECT * FROM student_supports LIMIT 1');
    if ((studSupports as any[]).length === 0) {
      console.log('🤝 Seeding initial student supports...');
      const { initialStudentSupports } = await import('../seeds/data/facilities.js');
      for (const s of initialStudentSupports) {
        await pool.query(
          'INSERT INTO student_supports (id, name, description, icon, color, iconBg, iconColor) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [s.id, s.name, s.description, s.icon || null, s.color || null, s.iconBg || null, s.iconColor || null]
        );
      }
      console.log('✅ Initial student supports seeded.');
    }

    console.log('🚀 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();
