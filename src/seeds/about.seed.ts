import pool from '../config/db.js';
import { initialAboutSettings } from './data/about.js';

export const seedAbout = async () => {
    console.log('📖 Seeding About Us Content...');
    for (const s of initialAboutSettings) {
        const id = `SET-ABOUT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
            `INSERT INTO settings (id, key_name, value, label, group_name, type)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value), label = VALUES(label), group_name = VALUES(group_name), type = VALUES(type)`,
            [id, s.key_name, s.value, s.label, s.group_name, s.type || 'json']
        );
    }
    console.log(`✅ Seeded ${initialAboutSettings.length} About Us settings.`);
};
