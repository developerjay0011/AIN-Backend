import pool from '../config/db.js';
import { seedStaff } from './staff.seed.js';
import { seedAdmins } from './admins.seed.js';
import { seedEvents } from './events.seed.js';
import { seedNotices } from './notices.seed.js';
import { seedSettings } from './settings.seed.js';
import { seedInstitutional } from './institutional.seed.js';

const runAllSeeds = async () => {
    try {
        console.log('🚀 Starting Master Production Seed...');
        console.log('-----------------------------------');

        // Phase 0: Cleanup
        console.log('🧹 Cleaning up existing data...');
        const tables = [
            'hero_slides', 'achievements', 'gallery_events', 'gallery_media',
            'notices', 'notice_links', 'staff', 'toppers', 'aqars',
            'admins', 'quality_metrics', 'settings'
        ];
        for (const table of tables) {
            await pool.query(`DELETE FROM ${table}`);
        }
        console.log('✅ Database cleared.');

        // Execute in logical order
        await seedAdmins();
        await seedStaff();
        await seedEvents();
        await seedNotices();
        await seedInstitutional();
        await seedSettings();

        console.log('-----------------------------------');
        console.log('✨ ALL PRODUCTION SEEDS COMPLETED! ✨');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING FAILED:', error);
        process.exit(1);
    }
};

runAllSeeds();
