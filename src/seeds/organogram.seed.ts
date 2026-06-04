import pool from '../config/db.js';

export const seedOrganogram = async () => {
    const nodes = [
        {
            id: 'awes',
            title: 'AWES Governing Body',
            level: 1,
            parentId: null,
            memberId: null,
            customName: 'AWES Governing Body',
            customSubtitle: 'Patron-in-Chief / Chairman',
            sortOrder: 0
        },
        {
            id: 'director-node',
            title: 'Director (Admin & Finance)',
            level: 2,
            parentId: 'awes',
            memberId: 'director',
            customName: null,
            customSubtitle: null,
            sortOrder: 0
        },
        {
            id: 'registrar-node',
            title: 'Registrar (Operations)',
            level: 2,
            parentId: 'awes',
            memberId: 'registrar',
            customName: null,
            customSubtitle: null,
            sortOrder: 1
        },
        {
            id: 'principal-node',
            title: 'Principal (Academic Head)',
            level: 3,
            parentId: 'director-node',
            memberId: 'principal',
            customName: null,
            customSubtitle: null,
            sortOrder: 0
        },
        {
            id: 'vice-principal-node',
            title: 'Vice Principal',
            level: 3,
            parentId: 'principal-node',
            memberId: 'vice-principal',
            customName: null,
            customSubtitle: null,
            sortOrder: 1
        },
        {
            id: 'academic-wing-node',
            title: 'Academic Wing',
            level: 4,
            parentId: 'principal-node',
            memberId: null,
            customName: 'Academic Wing',
            customSubtitle: 'Teaching Faculty',
            sortOrder: 0
        },
        {
            id: 'clinical-wing-node',
            title: 'Clinical Wing',
            level: 4,
            parentId: 'vice-principal-node',
            memberId: null,
            customName: 'Clinical Wing',
            customSubtitle: 'Supervisors / Instructors',
            sortOrder: 1
        },
        {
            id: 'admin-wing-node',
            title: 'Administration',
            level: 4,
            parentId: 'registrar-node',
            memberId: null,
            customName: 'Administration',
            customSubtitle: 'Office & Finance Staff',
            sortOrder: 2
        },
        {
            id: 'support-wing-node',
            title: 'Support Wing',
            level: 4,
            parentId: 'registrar-node',
            memberId: null,
            customName: 'Support Wing',
            customSubtitle: 'Services & Facilities',
            sortOrder: 3
        }
    ];

    console.log('🌳 Seeding Organogram Nodes...');
    
    // First clear existing
    await pool.query('DELETE FROM organogram_nodes');
    
    // Insert nodes sequentially or handle dependency order
    // Order matters since parentId must exist. Seed by level:
    const levels = [1, 2, 3, 4];
    for (const lvl of levels) {
        const lvlNodes = nodes.filter(n => n.level === lvl);
        for (const node of lvlNodes) {
            await pool.query(
                `INSERT INTO organogram_nodes (id, title, level, parentId, memberId, customName, customSubtitle, sortOrder)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [node.id, node.title, node.level, node.parentId, node.memberId, node.customName, node.customSubtitle, node.sortOrder]
            );
        }
    }
    
    console.log(`✅ Seeded ${nodes.length} organogram nodes.`);
};
