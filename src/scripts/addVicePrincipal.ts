import pool from '../config/db.js';

/**
 * One-off script: Insert Vice Principal staff record.
 * Run with: npx tsx src/scripts/addVicePrincipal.ts
 */
const addVicePrincipal = async () => {
    await pool.query(
        `INSERT IGNORE INTO staff
        (id, name, designation, type, image, qualification, experience, specialization, department, section, role, quote, description, sortOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            'acad-001',
            'Mrs. Deepa Sharma',
            'M.Sc Nursing',
            'academic-staff',
            null,
            'M.Sc Nursing, Ph.D (Pursuing)',
            '18 Years in Nursing Education & Administration',
            'Academic Administration, Curriculum Planning, Clinical Supervision',
            null,
            'academic-staff',
            'Vice Principal',
            'Leadership in nursing begins with leading by example — in knowledge, in compassion, and in service.',
            'Mrs. Deepa Sharma assists the Principal in academic administration and curriculum planning. She oversees faculty coordination, student affairs, and institutional compliance, ensuring the highest standards of nursing education are maintained at AIN Guwahati.',
            10
        ]
    );
    console.log('✅ Vice Principal inserted (or already existed).');
    await pool.end();
};

addVicePrincipal().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
