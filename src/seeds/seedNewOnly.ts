import pool from '../config/db.js';
import { seedResearch } from './research.seed.js';
import { seedPublications } from './publications.seed.js';

export const seedNewOnly = async () => {
    try {
        console.log('🌱 Checking and seeding only new / missing seed data...');
        console.log('--------------------------------------------------');

        const [initiatives]: any = await pool.query('SELECT COUNT(*) as count FROM research_initiatives');
        if (initiatives[0].count === 0) {
            await seedResearch();
        }

        // Checks if publications data exists before running seedPublications()
        const [pubs]: any = await pool.query('SELECT COUNT(*) as count FROM publications');
        if (pubs[0].count === 0) {
            await seedPublications();
        }

        console.log('--------------------------------------------------');
        console.log('✨ Seed incremental check completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Incremental seeding failed:', error);
        process.exit(1);
    }
};

seedNewOnly();
