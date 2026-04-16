import pool from '../config/db.js';

async function cleanupLocalUrls() {
  console.log('🔍 Starting database cleanup of local URLs...');
  
  try {
    // We search for settings that contain "http://localhost:5001"
    const [rows] = await pool.query('SELECT id, key_name, value FROM settings WHERE value LIKE "%http://localhost:5001%"');
    
    if ((rows as any[]).length === 0) {
      console.log('✅ No hardcoded localhost URLs found.');
      return;
    }

    console.log(`Found ${(rows as any[]).length} rows with localhost URLs. Updating...`);

    for (const row of (rows as any[])) {
      // Replace http://localhost:5001 with empty string to make it relative
      const cleanedValue = row.value.replace(/http:\/\/localhost:5001/g, '');
      
      await pool.query('UPDATE settings SET value = ? WHERE id = ?', [cleanedValue, row.id]);
      console.log(`  - Updated ${row.key_name}`);
    }

    console.log('✨ Cleanup complete! Settings now use relative paths.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
}

cleanupLocalUrls();
