import pool from '../config/db.js';

export const seedRecognitions = async () => {
    console.log('📜 Seeding Recognitions & Certificates...');

    const defaultTypes = [
        { id: 'rectype-regulatory', name: 'Regulatory Approvals' },
        { id: 'rectype-affiliations', name: 'University Affiliations' },
        { id: 'rectype-certifications', name: 'Certifications' }
    ];

    const defaultRecognitions = [
        {
            id: 'recognition-1',
            title: 'Indian Nursing Council Approval Certificate',
            image: '/uploads/images/settings/inc-logo.png',
            recognitionTypeId: 'rectype-regulatory'
        },
        {
            id: 'recognition-2',
            title: 'Assam Nurses\' Midwives\' & Health Visitors\' Council Registry',
            image: '/uploads/images/settings/anmhvc-logo.png',
            recognitionTypeId: 'rectype-regulatory'
        },
        {
            id: 'recognition-3',
            title: 'Srimanta Sankaradeva University of Health Sciences Affiliation Letter',
            image: '/uploads/images/settings/ssuhs-logo.png',
            recognitionTypeId: 'rectype-affiliations'
        },
        {
            id: 'recognition-4',
            title: 'ISO 9001:2015 Quality Management Certificate',
            image: '/uploads/images/settings/tnai-logo.png',
            recognitionTypeId: 'rectype-certifications'
        }
    ];

    // Delete existing records to allow clean reseed
    await pool.query('DELETE FROM recognitions WHERE id LIKE "recognition-%"');
    await pool.query('DELETE FROM recognition_types WHERE id LIKE "rectype-%"');

    for (const t of defaultTypes) {
        await pool.query(
            'INSERT INTO recognition_types (id, name) VALUES (?, ?)',
            [t.id, t.name]
        );
    }

    for (const r of defaultRecognitions) {
        await pool.query(
            'INSERT INTO recognitions (id, title, image, recognitionTypeId) VALUES (?, ?, ?, ?)',
            [r.id, r.title, r.image, r.recognitionTypeId]
        );
    }

    console.log(`✅ Seeded ${defaultTypes.length} recognition types and ${defaultRecognitions.length} recognitions.`);
};
