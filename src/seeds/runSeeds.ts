import pool from '../config/db.js';
import { seedHero } from './hero.seed.js';
import { seedStaff } from './staff.seed.js';
import { seedAbout } from './about.seed.js';
import { seedAdmins } from './admins.seed.js';
import { seedEvents } from './events.seed.js';
import { seedAlumni } from './alumni.seed.js';
import { seedNotices } from './notices.seed.js';
import { seedSettings } from './settings.seed.js';
import { seedInquiries } from './inquiry.seed.js';
import { seedPlacement } from './placement.seed.js';
import { seedDepartments } from './departments.seed.js';
import { seedInstitutional } from './institutional.seed.js';
import { seedAdministration } from './administration.seed.js';
import { seedOrganogram } from './organogram.seed.js';

const runAllSeeds = async () => {
    try {
        console.log('🚀 Starting Master Production Seed...');
        console.log('-----------------------------------');

        // Phase 0: Cleanup
        console.log('🧹 Cleaning up existing data...');
        const tables = [
            'gallery_media', 'gallery_events', 'notice_links', 'notices',
            'hero_slides', 'achievements', 'staff', 'toppers', 'aqars',
            'admins', 'quality_metrics', 'settings', 'departments',
            'admission_inquiries', 'contact_inquiries', 'alumni_milestones',
            'alumni_activities', 'alumni_members', 'alumni_executives',
            'placement_members', 'placement_stats', 'placement_highlights',
            'organogram_nodes',
            'administration_members'
        ];
        for (const table of tables) {
            await pool.query(`DELETE FROM ${table}`);
        }
        console.log('✅ Database cleared.');

        // Execute in logical order
        await seedAdmins();
        await seedStaff();
        await seedDepartments();
        await seedEvents();
        await seedInquiries();
        await seedNotices();
        await seedInstitutional();
        await seedAbout();
        await seedSettings();
        await seedHero();
        await seedAlumni();
        await seedPlacement();
        await seedAdministration();
        await seedOrganogram();

        console.log('-----------------------------------');
        console.log('✨ ALL PRODUCTION SEEDS COMPLETED! ✨');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING FAILED:', error);
        process.exit(1);
    }
};

runAllSeeds();
