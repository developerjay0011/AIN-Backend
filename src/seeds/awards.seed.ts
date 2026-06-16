import pool from '../config/db.js';

export const seedAwards = async () => {
    console.log('🏆 Seeding Awards & Award Types...');

    const defaultTypes = [
        { id: 'type-student', name: 'Student' },
        { id: 'type-faculty', name: 'Faculty' },
        { id: 'type-institute', name: 'Institute' }
    ];

    const defaultAwards = [
        {
            id: 'award-1',
            title: 'Best Student Nurse Award 2026',
            details: 'Awarded to Ms. Anjali Sharma of B.Sc. Nursing 4th Year for outstanding clinical proficiency and academic performance throughout the program.',
            image: '/uploads/unsplash_photo-1576765608535-5f04d1e3f289.jpg',
            awardTypeId: 'type-student'
        },
        {
            id: 'award-2',
            title: 'Outstanding Research Publication Award',
            details: 'Presented to Dr. Preeti Baruah for publishing high-impact research on neonatal care practices in international nursing journals.',
            image: '/uploads/unsplash_photo-1581578731548-c64695cc6952.jpg',
            awardTypeId: 'type-faculty'
        },
        {
            id: 'award-3',
            title: 'National Infrastructure Excellence Award',
            details: 'Army Institute of Nursing, Guwahati received the prestigious Green Campus and Infrastructure Excellence Award 2026 for state-of-the-art facilities.',
            image: '/uploads/unsplash_photo-1541339907198-e08756dedf3f.jpg',
            awardTypeId: 'type-institute'
        }
    ];

    // Delete existing records to allow clean reseed
    await pool.query('DELETE FROM awards WHERE id LIKE "award-%"');
    await pool.query('DELETE FROM award_types WHERE id LIKE "type-%"');

    for (const t of defaultTypes) {
        await pool.query(
            'INSERT INTO award_types (id, name) VALUES (?, ?)',
            [t.id, t.name]
        );
    }

    for (const a of defaultAwards) {
        await pool.query(
            'INSERT INTO awards (id, title, details, image, awardTypeId) VALUES (?, ?, ?, ?, ?)',
            [a.id, a.title, a.details, a.image, a.awardTypeId]
        );
    }

    console.log(`✅ Seeded ${defaultTypes.length} award types and ${defaultAwards.length} awards.`);
};
