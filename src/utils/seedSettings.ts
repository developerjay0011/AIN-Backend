import pool from '../config/db.js';

const seedSettings = async () => {
  try {
    console.log('⏳ Seeding and updating settings...');

    const { initialSettings } = await import('../seeds/data/settings.js');
    let addedCount = 0;

    for (const s of initialSettings) {
      const id = `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await pool.query(
        `INSERT IGNORE INTO settings (id, key_name, value, label, group_name, type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, s.key_name, s.value, s.label, s.group_name, s.type || 'text']
      );
      addedCount++;
      console.log(`✅ Seeded/Updated setting: ${s.key_name}`);
    }

    console.log(`🚀 Successfully seeded/updated ${addedCount} settings.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Settings seeding failed:', error);
    process.exit(1);
  }
};

seedSettings();
