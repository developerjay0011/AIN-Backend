import pool from '../config/db.js';

export const seedAdmins = async () => {
    const records = [
        ['ADM-1775880000000', 'admin', '$2b$10$9ed6GQhsDIsGy0ew1I/LYeQ4tXH62kzkY8rnvc98a4pRfYvzY/EZu'],
        ['ADM-1775880000001', 'testadmin', '$2b$10$1cfygt7DlR8Y1Nr6peKFO.cy/MDpDqF0Ouqo.xpZYPfrtgpaobMoy']
    ];

    console.log('👥 Seeding Admins...');
    for (const [id, username, password] of records) {
        await pool.query(
            'REPLACE INTO admins (id, username, password) VALUES (?, ?, ?)',
            [id, username, password]
        );
    }
    console.log(`✅ Seeded ${records.length} admins.`);
};
