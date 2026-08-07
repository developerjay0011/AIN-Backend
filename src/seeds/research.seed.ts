import pool from '../config/db.js';

export const seedResearch = async () => {
    console.log('🔬 Seeding Research Pool Data...');

    // 1. Seed Research Initiatives
    const initiatives = [
        {
            title: 'Evidence-Based Practice in Nursing',
            description: 'Ongoing study on integrating latest healthcare research into clinical teaching protocols.',
            status: 'Active',
            lead: 'Dr. S. Devi',
            category: 'Clinical'
        },
        {
            title: 'Community Health Assessment',
            description: 'Comprehensive analysis of rural healthcare accessibility and intervention effectiveness.',
            status: 'Ongoing',
            lead: 'Lt Col P. Singh',
            category: 'Public Health'
        },
        {
            title: 'Digital Literacy in Nursing Education',
            description: 'Empirical research on the impact of simulation-based learning on student competency.',
            status: 'Published',
            lead: 'Mrs. Anjali Sharma',
            category: 'Education'
        }
    ];

    for (const init of initiatives) {
        await pool.query(
            `INSERT INTO research_initiatives (title, description, status, lead, category)
             VALUES (?, ?, ?, ?, ?)`,
            [init.title, init.description, init.status, init.lead, init.category]
        );
    }
    console.log(`✅ Seeded ${initiatives.length} research initiatives.`);

    // 2. Seed IRC Members
    const ircMembers = [
        { name: 'Maj Gen (Dr.) R. K. Sharma', role: 'Chairperson', specialization: 'Medical Research' },
        { name: 'Col (Mrs.) S. Devi', role: 'Member Secretary', specialization: 'Nursing Administration' },
        { name: 'Dr. Hemant Baruah', role: 'External Expert', specialization: 'Bio-Ethics' },
        { name: 'Mrs. P. Singh', role: 'Member', specialization: 'Community Health' },
        { name: 'Mr. Rajesh Kumar', role: 'Legal Expert', specialization: 'Medical Jurisprudence' }
    ];

    for (const member of ircMembers) {
        await pool.query(
            `INSERT INTO research_irc_members (name, role, specialization)
             VALUES (?, ?, ?)`,
            [member.name, member.role, member.specialization]
        );
    }
    console.log(`✅ Seeded ${ircMembers.length} IRC members.`);

    // 3. Seed Research Bulletins
    const bulletins = [
        {
            title: 'Research Review - Quarter 1, 2026',
            date: 'March 15, 2026',
            size: '2.4 MB',
            type: 'PDF',
            description: 'Focus on pediatric nursing interventions and community health milestones.',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            title: 'Annual Research Compendium 2025',
            date: 'January 10, 2026',
            size: '5.8 MB',
            type: 'PDF',
            description: 'Comprehensive collection of all research papers published by faculty in 2025.',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            title: 'Ethical Guidelines Handbook v3.0',
            date: 'December 01, 2025',
            size: '1.2 MB',
            type: 'PDF',
            description: 'Updated protocols for Institutional Review Committee submissions.',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        }
    ];

    for (const bulletin of bulletins) {
        await pool.query(
            `INSERT INTO research_bulletins (title, date, size, type, description, fileUrl)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [bulletin.title, bulletin.date, bulletin.size, bulletin.type, bulletin.description, bulletin.fileUrl]
        );
    }
    console.log(`✅ Seeded ${bulletins.length} research bulletins.`);

    // 4. Seed Research Cell Details
    const cellDescription = 'Our dedicated Research Cell serves as the cornerstone of academic inquiry at Army Institute of Nursing Guwahati. We foster an environment where faculty and students collaborate on meaningful research that pushes the boundaries of nursing science.';
    const cellPoints = JSON.stringify([
        'Facilitating interdisciplinary research projects',
        'Organizing research methodology workshops',
        'Providing statistical and grant-writing support',
        'Maintaining internal research databases'
    ]);
    const cellImage = '/uploads/images/research/research-overview.jpg';
    const ircDescription = 'The IRC ensures all research conducted by students and faculty adheres to the highest ethical standards and protocols, protecting the rights and welfare of research participants.';
    const submissionSteps = JSON.stringify([
        { title: 'Protocol Submission', desc: 'Submit research proposal with ethical clearance forms.' },
        { title: 'Initial Review', desc: 'Committee members review the methodology and ethical considerations.' },
        { title: 'Decision Meeting', desc: 'Monthly meeting to discuss and approve/query submissions.' },
        { title: 'Periodic Reporting', desc: 'Researchers provide updates on progress and safety data.' }
    ]);

    await pool.query(
        `INSERT INTO research_cell (description, points, image, ircDescription, submissionSteps) VALUES (?, ?, ?, ?, ?)`,
        [cellDescription, cellPoints, cellImage, ircDescription, submissionSteps]
    );
    console.log('✅ Seeded Research Cell details.');
};
