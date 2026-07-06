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
          section VARCHAR(50) DEFAULT NULL,
          role VARCHAR(255) DEFAULT NULL,
          quote TEXT DEFAULT NULL,
          description TEXT DEFAULT NULL,
          sortOrder INT DEFAULT 0,
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
          name VARCHAR(255) NOT NULL,
          shortName VARCHAR(100) NOT NULL,
          overview TEXT,
          areas TEXT,
          clinicalHours VARCHAR(255),
          hod VARCHAR(255),
          facilities TEXT,
          icon VARCHAR(255) DEFAULT NULL,
          color VARCHAR(255) DEFAULT NULL,
          iconBg VARCHAR(255) DEFAULT NULL,
          iconColor VARCHAR(255) DEFAULT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
      alumni_announcements: `
        CREATE TABLE IF NOT EXISTS alumni_announcements (
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
      alumni_news: `
        CREATE TABLE IF NOT EXISTS alumni_news (
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
      alumni_committee_members: `
        CREATE TABLE IF NOT EXISTS alumni_committee_members (
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
      alumni_constitution_articles: `
        CREATE TABLE IF NOT EXISTS alumni_constitution_articles (
          id VARCHAR(255) PRIMARY KEY,
          sectionId VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          icon VARCHAR(100) DEFAULT 'FileText',
          content TEXT NOT NULL,
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
