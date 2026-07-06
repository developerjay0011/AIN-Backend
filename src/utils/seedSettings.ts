import pool from '../config/db.js';

const seedSettings = async () => {
  try {
    console.log('⏳ Seeding missing settings...');

    const [settings]: any = await pool.query('SELECT * FROM settings');
    const existingKeys = new Set(settings.map((s: any) => s.key_name));
    const { initialSettings } = await import('../seeds/data/settings.js');
    let addedCount = 0;

    for (const s of initialSettings) {
      if (!existingKeys.has(s.key_name)) {
        const id = `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
          'INSERT INTO settings (id, key_name, value, label, group_name, type) VALUES (?, ?, ?, ?, ?, ?)',
          [id, s.key_name, s.value, s.label, s.group_name, s.type || 'text']
        );
        addedCount++;
        console.log(`✅ Added setting: ${s.key_name}`);
      }
    }

    if (addedCount > 0) {
      console.log(`🚀 Successfully seeded ${addedCount} missing settings.`);
    } else {
      console.log(`✅ All settings are already up to date.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Settings seeding failed:', error);
    process.exit(1);
  }
};

seedSettings();
