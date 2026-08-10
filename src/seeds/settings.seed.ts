import pool from '../config/db.js';
import { initialSettings } from './data/settings.js';

export const seedSettings = async () => {
    console.log('⚙️ Seeding General Settings...');
    for (const s of initialSettings) {
        const id = `SET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
            `INSERT IGNORE INTO settings (id, key_name, value, label, group_name, type)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, s.key_name, s.value, s.label, s.group_name, s.type || 'text']
        );
    }
    console.log(`✅ Seeded ${initialSettings.length} general settings.`);
};
