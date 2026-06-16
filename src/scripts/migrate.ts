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
          \`order\` INT DEFAULT 0,
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
      events: `
        CREATE TABLE IF NOT EXISTS events (
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
      gallery_albums: `
        CREATE TABLE IF NOT EXISTS gallery_albums (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          coverImage TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      gallery_media: `
        CREATE TABLE IF NOT EXISTS gallery_media (
          id VARCHAR(255) PRIMARY KEY,
          albumId VARCHAR(255),
          type VARCHAR(20) NOT NULL,
          url TEXT NOT NULL,
          name VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (albumId) REFERENCES gallery_albums(id) ON DELETE CASCADE
        )`,
      notices: `
        CREATE TABLE IF NOT EXISTS notices (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          date VARCHAR(100),
          type VARCHAR(100),
          description TEXT,
          critical BOOLEAN DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      notice_links: `
        CREATE TABLE IF NOT EXISTS notice_links (
          id VARCHAR(255) PRIMARY KEY,
          noticeId VARCHAR(255),
          label VARCHAR(255),
          url TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (noticeId) REFERENCES notices(id) ON DELETE CASCADE
        )`,
      staff: `
        CREATE TABLE IF NOT EXISTS staff (
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
      toppers: `
        CREATE TABLE IF NOT EXISTS toppers (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          rankTag VARCHAR(255),
          \`rank\` VARCHAR(255),
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
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      admins: `
        CREATE TABLE IF NOT EXISTS admins (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
          hod VARCHAR(255),
          facilities TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      administration_members: `
        CREATE TABLE IF NOT EXISTS administration_members (
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
      alumni_activities: `
        CREATE TABLE IF NOT EXISTS alumni_activities (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          date VARCHAR(100),
          description TEXT,
          imageUrl TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      alumni_members: `
        CREATE TABLE IF NOT EXISTS alumni_members (
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
      alumni_executives: `
        CREATE TABLE IF NOT EXISTS alumni_executives (
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
      placement_members: `
        CREATE TABLE IF NOT EXISTS placement_members (
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
      placement_stats: `
        CREATE TABLE IF NOT EXISTS placement_stats (
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
      placement_highlights: `
        CREATE TABLE IF NOT EXISTS placement_highlights (
          id VARCHAR(255) PRIMARY KEY,
          type VARCHAR(100) DEFAULT 'general',
          text TEXT NOT NULL,
          sortOrder INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      placement_collaborations: `
        CREATE TABLE IF NOT EXISTS placement_collaborations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          logoUrl TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      placement_resources: `
        CREATE TABLE IF NOT EXISTS placement_resources (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          fileUrl TEXT NOT NULL,
          type VARCHAR(50) NOT NULL,
          year INT DEFAULT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      programs: `
        CREATE TABLE IF NOT EXISTS programs (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      courses: `
        CREATE TABLE IF NOT EXISTS courses (
          id VARCHAR(255) PRIMARY KEY,
          programId VARCHAR(255) NOT NULL,
          image TEXT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE CASCADE
        )`,
      campus_facilities: `
        CREATE TABLE IF NOT EXISTS campus_facilities (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image TEXT,
          features TEXT
        )`,
      hostel_details: `
        CREATE TABLE IF NOT EXISTS hostel_details (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255),
          description TEXT,
          amenities TEXT,
          wardenName VARCHAR(255),
          wardenPhone VARCHAR(255),
          ruleBookPdf TEXT
        )`,
      sna_details: `
        CREATE TABLE IF NOT EXISTS sna_details (
          id VARCHAR(255) PRIMARY KEY,
          objectives TEXT,
          executiveCommittee TEXT,
          functionalCommittees TEXT,
          annualEvents TEXT
        )`,
      student_supports: `
        CREATE TABLE IF NOT EXISTS student_supports (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(255),
          color VARCHAR(255),
          iconBg VARCHAR(255),
          iconColor VARCHAR(255)
        )`,
      award_types: `
        CREATE TABLE IF NOT EXISTS award_types (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      awards: `
        CREATE TABLE IF NOT EXISTS awards (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          details TEXT,
          image TEXT,
          awardTypeId VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (awardTypeId) REFERENCES award_types(id) ON DELETE SET NULL
        )`,
      recognition_types: `
        CREATE TABLE IF NOT EXISTS recognition_types (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
      recognitions: `
        CREATE TABLE IF NOT EXISTS recognitions (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          details TEXT,
          image TEXT,
          recognitionTypeId VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (recognitionTypeId) REFERENCES recognition_types(id) ON DELETE SET NULL
        )`
    };

    for (const [name, query] of Object.entries(tables)) {
      let finalQuery = query.trim();
      if (!finalQuery.includes('CHARACTER SET') && !finalQuery.includes('COLLATE')) {
        finalQuery += ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci';
      }
      await pool.query(finalQuery);
      // console.log(`✓ Table checked: ${name}`);
    }

    // Ensure 'staff' table has 'designation' instead of 'role'
    try {
      const [hasRole]: any = await pool.query("SHOW COLUMNS FROM staff LIKE 'role'");
      const [hasDesignation]: any = await pool.query("SHOW COLUMNS FROM staff LIKE 'designation'");
      if (hasRole.length > 0 && hasDesignation.length === 0) {
        console.log("⏳ Renaming column 'role' to 'designation' in 'staff'...");
        await pool.query("ALTER TABLE staff CHANGE COLUMN role designation VARCHAR(255)");
        console.log("✅ Column 'role' renamed to 'designation'.");
      } else if (hasDesignation.length === 0) {
        console.log("⏳ Adding missing column 'designation' to table 'staff'...");
        await pool.query("ALTER TABLE staff ADD COLUMN designation VARCHAR(255) AFTER name");
        console.log("✅ Column 'designation' added.");
      }
      
      if (hasRole.length > 0 && hasDesignation.length > 0) {
        console.log("⏳ Dropping redundant column 'role' from 'staff'...");
        await pool.query("ALTER TABLE staff DROP COLUMN role");
        console.log("✅ Redundant column 'role' dropped.");
      }
    } catch (err: any) {
      console.warn("⚠️  Could not migrate staff columns:", err.message);
    }

    // 2. Incremental Migrations (Adding missing columns safely)
    const migrations = [
      // departments table
      { table: 'departments', column: 'departmentId', query: 'ALTER TABLE departments ADD COLUMN departmentId VARCHAR(255) UNIQUE AFTER id' },
      { table: 'departments', column: 'shortName', query: 'ALTER TABLE departments ADD COLUMN shortName VARCHAR(100) AFTER name' },
      { table: 'departments', column: 'sortOrder', query: 'ALTER TABLE departments ADD COLUMN sortOrder INT DEFAULT 0 AFTER clinicalHours' },
      { table: 'departments', column: 'hod', query: 'ALTER TABLE departments ADD COLUMN hod VARCHAR(255) AFTER clinicalHours' },
      { table: 'departments', column: 'facilities', query: 'ALTER TABLE departments ADD COLUMN facilities TEXT AFTER hod' },

      // hero_slides table
      { table: 'hero_slides', column: 'tag', query: 'ALTER TABLE hero_slides ADD COLUMN tag VARCHAR(100) DEFAULT \'main\' AFTER imageUrl' },

      // notice_links table (NEW migration)
      { table: 'notice_links', column: 'createdAt', query: 'ALTER TABLE notice_links ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { table: 'notice_links', column: 'updatedAt', query: 'ALTER TABLE notice_links ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },

      // gallery_media table (NEW migration)
      { table: 'gallery_media', column: 'createdAt', query: 'ALTER TABLE gallery_media ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { table: 'gallery_media', column: 'updatedAt', query: 'ALTER TABLE gallery_media ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },

      // admins table (NEW migration)
      { table: 'admins', column: 'updatedAt', query: 'ALTER TABLE admins ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },

      // administration_members — section column
      { table: 'administration_members', column: 'section', query: "ALTER TABLE administration_members ADD COLUMN section VARCHAR(50) DEFAULT 'director' AFTER designation" },

      // administration_members — role column
      { table: 'administration_members', column: 'role', query: 'ALTER TABLE administration_members ADD COLUMN role VARCHAR(255) AFTER section' },
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
        if (colErr.errno !== 1060) {
          console.warn(`⚠️  Could not add column ${m.column} to ${m.table}:`, colErr.message);
        }
      }
    }

    // Explicitly remove title, subtitle, link, and isActive from hero_slides as requested
    const columnsToRemove = ['title', 'subtitle', 'link', 'isActive'];
    for (const col of columnsToRemove) {
      try {
        const [exists]: any = await pool.query(`SHOW COLUMNS FROM hero_slides LIKE ?`, [col]);
        if (exists.length > 0) {
          console.log(`⏳ Removing column '${col}' from 'hero_slides'...`);
          await pool.query(`ALTER TABLE hero_slides DROP COLUMN ${col}`);
          console.log(`✅ Column '${col}' removed.`);
        }
      } catch (err: any) {
        console.warn(`⚠️  Could not remove column ${col}:`, err.message);
      }
    }

    // Clean up redundant settings: 'About Us' group is now handled by /api/about
    console.log('⏳ Cleaning up redundant settings...');
    await pool.query("DELETE FROM settings WHERE group_name = 'About Us'");
    console.log('✅ Redundant settings removed.');

    // Backfill section column for existing administration_members rows
    try {
      const [sectionCol]: any = await pool.query("SHOW COLUMNS FROM administration_members LIKE 'section'");
      if (sectionCol.length > 0) {
        await pool.query("UPDATE administration_members SET section = 'director'  WHERE id = 'director'  AND (section IS NULL OR section = 'director')");
        await pool.query("UPDATE administration_members SET section = 'principal' WHERE id = 'principal' AND (section IS NULL OR section = 'director')");
        await pool.query("UPDATE administration_members SET section = 'registrar' WHERE id = 'registrar' AND (section IS NULL OR section = 'director')");
        // All others default to 'academic-staff' if they still have the default 'director' and are not core
        await pool.query("UPDATE administration_members SET section = 'academic-staff' WHERE id NOT IN ('director','principal','registrar') AND section = 'director'");
        console.log('✅ Section backfill for administration_members complete.');
      }
    } catch (err: any) {
      console.warn('⚠️  Could not backfill section column:', err.message);
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
