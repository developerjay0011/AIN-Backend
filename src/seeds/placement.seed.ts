import pool from '../config/db.js';

export const seedPlacement = async () => {
    // 1. Placement Members
    const members = [
        {
            id: 'PM-001',
            name: 'Prof Kabita Baishya',
            designation: 'Offg Principal',
            role: 'OIC Placement Cell',
            email: '',
            imageUrl: ''
        },
        {
            id: 'PM-002',
            name: 'Mrs Anupama Pathak',
            designation: 'Coordinator',
            role: 'Coordinator, Placement Cell',
            email: '',
            imageUrl: ''
        },
        {
            id: 'PM-003',
            name: 'Mrs Yendrembam Bidyarani Devi',
            designation: 'Class Coordinator',
            role: 'Class Coordinator, IV Year B Sc Nursing',
            email: '',
            imageUrl: ''
        },
        {
            id: 'PM-004',
            name: 'Ms Chandana',
            designation: 'Student Representative',
            role: 'Student Representative, IV Year B Sc Nursing',
            email: '',
            imageUrl: ''
        },
        {
            id: 'PM-005',
            name: 'Ms Sakshi Mane',
            designation: 'Student Representative',
            role: 'Student Representative, IV Year B Sc Nursing',
            email: '',
            imageUrl: ''
        }
    ];

    console.log('💼 Seeding Placement Cell Members...');
    for (let i = 0; i < members.length; i++) {
        const m = members[i];
        await pool.query(
            'REPLACE INTO placement_members (id, name, designation, role, email, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [m.id, m.name, m.designation, m.role, m.email || null, m.imageUrl || null, i]
        );
    }
    console.log(`✅ Seeded ${members.length} placement members.`);

    // 2. Placement Stats
    const stats = [
        { id: 'PS-001', year: '2021-22', hospitalsCount: 7, eligibleStudents: 48, placedStudents: 48, placementPercentage: 100.00 },
        { id: 'PS-002', year: '2022-23', hospitalsCount: 9, eligibleStudents: 49, placedStudents: 49, placementPercentage: 100.00 },
        { id: 'PS-003', year: '2023-24', hospitalsCount: 6, eligibleStudents: 50, placedStudents: 50, placementPercentage: 100.00 },
        { id: 'PS-004', year: '2024-25', hospitalsCount: 5, eligibleStudents: 48, placedStudents: 48, placementPercentage: 100.00 }
    ];

    console.log('📊 Seeding Placement Statistics...');
    for (const s of stats) {
        await pool.query(
            'REPLACE INTO placement_stats (id, year, hospitalsCount, eligibleStudents, placedStudents, placementPercentage) VALUES (?, ?, ?, ?, ?, ?)',
            [s.id, s.year, s.hospitalsCount, s.eligibleStudents, s.placedStudents, s.placementPercentage]
        );
    }
    console.log(`✅ Seeded ${stats.length} placement stats entries.`);

    // 3. Placement Highlights
    const highlights = [
        // General highlights
        { id: 'PH-001', type: 'general', text: '100% Placement Record of all passed out batches.' },
        { id: 'PH-002', type: 'general', text: 'Reputed Hospitals are coming fwd for campus placement.' },
        { id: 'PH-003', type: 'general', text: '46 students have joined MNS as SSC Offr.' },
        { id: 'PH-004', type: 'general', text: '30+ students successfully settled in abroad.' },
        // Alumni achievements
        { id: 'PH-005', type: 'alumni', text: '1 x student Joined as DSP of Uttar Pradesh Police in the year 2020 (Batch 2007)' },
        { id: 'PH-006', type: 'alumni', text: '1 x student Joined in CRPF as Nb/ Sub in the year 2018 (Batch 2009).' },
        { id: 'PH-007', type: 'alumni', text: '1x student cleared NCLEX and proceeding to USA to study MSc Nursing.' },
        { id: 'PH-008', type: 'alumni', text: '10+ students joined as Nursing Officer in AIIMS.' }
    ];

    console.log('🏆 Seeding Placement Highlights & Achievements...');
    for (let i = 0; i < highlights.length; i++) {
        const h = highlights[i];
        await pool.query(
            'REPLACE INTO placement_highlights (id, type, text, sortOrder) VALUES (?, ?, ?, ?)',
            [h.id, h.type, h.text, i]
        );
    }
    console.log(`✅ Seeded ${highlights.length} placement highlights.`);

    // 4. Placement Collaborations
    const collaborations = [
        { id: 'PC-001', name: 'Apollo Hospitals' },
        { id: 'PC-002', name: 'Max Healthcare' },
        { id: 'PC-003', name: 'Fortis Escorts' },
        { id: 'PC-004', name: 'Medanta The Medicity' },
        { id: 'PC-005', name: 'AIIMS Guwahati' },
        { id: 'PC-006', name: 'Base Hospital Basistha' },
        { id: 'PC-007', name: 'GNRC Hospitals' },
        { id: 'PC-008', name: 'Narayana Health' }
    ];

    console.log('🤝 Seeding Placement Collaborations...');
    for (const c of collaborations) {
        await pool.query(
            'REPLACE INTO placement_collaborations (id, name, logoUrl) VALUES (?, ?, NULL)',
            [c.id, c.name]
        );
    }
    console.log(`✅ Seeded ${collaborations.length} placement collaborations.`);

    // 5. Placement Resources (Brochures & Policies)
    const resources = [
        { id: 'PR-001', title: 'Placement Brochure 2026-2027', description: 'Comprehensive student profiles and institutional data.', type: 'brochure', year: 2026, fileUrl: '/uploads/documents/general/dummy.pdf' },
        { id: 'PR-002', title: 'Placement Brochure 2025-2026', description: 'Comprehensive student profiles and institutional data.', type: 'brochure', year: 2025, fileUrl: '/uploads/documents/general/dummy.pdf' },
        { id: 'PR-003', title: 'Placement Brochure 2024-2025', description: 'Comprehensive student profiles and institutional data.', type: 'brochure', year: 2024, fileUrl: '/uploads/documents/general/dummy.pdf' },
        { id: 'PR-004', title: 'Placement Policy', description: 'Official regulations, eligibility criteria, and fair-opportunity protocols governing all placement activities.', type: 'policy', year: null, fileUrl: '/uploads/documents/general/dummy.pdf' },
        { id: 'PR-005', title: 'SOP for Placement', description: 'Standard Operating Procedures for students participating in placement drives.', type: 'policy', year: null, fileUrl: '/uploads/documents/general/dummy.pdf' }
    ];

    console.log('📄 Seeding Placement Resources...');
    for (const r of resources) {
        await pool.query(
            'REPLACE INTO placement_resources (id, title, description, fileUrl, type, year) VALUES (?, ?, ?, ?, ?, ?)',
            [r.id, r.title, r.description, r.fileUrl, r.type, r.year]
        );
    }
    console.log(`✅ Seeded ${resources.length} placement resources.`);
};
