import pool from '../config/db.js';
import { initialSettings } from './data/settings.js';
import { initialAboutSettings } from './data/about.js';

export const seedSettings = async () => {
    console.log('⚙️ Seeding Settings...');
    const allSettings = [...initialSettings, ...initialAboutSettings];
    for (const s of allSettings) {
        const id = `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
            'INSERT OR REPLACE INTO settings (id, key_name, value, label, group_name, type) VALUES (?, ?, ?, ?, ?, ?)',
            [id, s.key_name, s.value, s.label, s.group_name, s.type || 'text']
        );
    }
    console.log(`✅ Seeded ${allSettings.length} settings.`);
};
