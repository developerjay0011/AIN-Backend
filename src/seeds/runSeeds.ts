import pool from '../config/db.js';
import { seedHero } from './hero.seed.js';
import { seedStaff } from './staff.seed.js';
import { seedAbout } from './about.seed.js';
import { seedAwards } from './awards.seed.js';
import { seedAdmins } from './admins.seed.js';
import { seedEvents } from './events.seed.js';
import { seedAlumni } from './alumni.seed.js';
import { seedNotices } from './notices.seed.js';
import { seedSettings } from './settings.seed.js';
import { seedInquiries } from './inquiry.seed.js';
import { seedPrograms } from './programs.seed.js';
import { seedPlacement } from './placement.seed.js';
import { seedFacilities } from './facilities.seed.js';
import { seedDepartments } from './departments.seed.js';
import { seedRecognitions } from './recognitions.seed.js';
import { seedInstitutional } from './institutional.seed.js';


const runAllSeeds = async () => {
    try {
        console.log('🚀 Starting Master Production Seed...');
        console.log('-----------------------------------');

        // Phase 0: Cleanup
        console.log('🧹 Cleaning up existing data...');
        const tables = [
            'awards', 'award_types',
            'recognitions', 'recognition_types',
            'gallery_media', 'gallery_albums', 'notice_links', 'notices',
            'hero_slides', 'achievements', 'staff', 'toppers', 'aqars',
            'admins', 'quality_metrics', 'settings', 'departments',
            'admission_inquiries', 'contact_inquiries', 'alumni_milestones',
            'alumni_activities', 'alumni_members', 'alumni_executives',
            'placement_members', 'placement_stats', 'placement_highlights',
            'courses', 'programs',
            'campus_facilities', 'hostel_details', 'sna_details', 'student_supports'
        ];
        for (const table of tables) {
            await pool.query(`DELETE FROM ${table}`);
        }
        console.log('✅ Database cleared.');

        // Execute in logical order
        await seedAdmins();
        await seedStaff();
        await seedDepartments();
        await seedPrograms();
        await seedEvents();
        await seedInquiries();
        await seedNotices();
        await seedInstitutional();
        await seedAbout();
        await seedSettings();
        await seedFacilities();
        await seedHero();
        await seedAlumni();
        await seedPlacement();
        await seedAwards();
        await seedRecognitions();

        console.log('-----------------------------------');
        console.log('✨ ALL PRODUCTION SEEDS COMPLETED! ✨');
        process.exit(0);
    } catch (error) {
        console.error('❌ SEEDING FAILED:', error);
        process.exit(1);
    }
};

runAllSeeds();
