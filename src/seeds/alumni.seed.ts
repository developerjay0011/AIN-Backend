import pool from '../config/db.js';

export const seedAlumni = async () => {
    const milestones = [
        { 
            id: 'ALM-2015-001', 
            year: '2015', 
            title: 'Association Founded', 
            desc: 'Formed the original committee setup representing charter batches with over 200 initial members. This laid the foundation for long-term cooperative networks uniting professional nursing healthcare spaces globally along shared vision coefficients frameworks workflows setups.', 
            img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop' 
        },
        { 
            id: 'ALM-2016-001', 
            year: '2016', 
            title: 'First Annual Meet', 
            desc: 'Hosted the inaugural mega-meet bringing together graduates across batches to network. Keynotes addressed by senior directors focused purely on building modern nursing methodologies addressing mentorship gap updates triggers configurations workflows layout designs configs.', 
            img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop' 
        },
        { 
            id: 'ALM-2018-001', 
            year: '2018', 
            title: 'Digital Portal Launch', 
            desc: 'Launched the online alumni portal tracking global coordinates. Enables simple lookup and direct mailing connections supporting mentorship guidelines addressing updates triggers setups configuration workflows configurations triggers structures absolute.', 
            img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop' 
        },
        { 
            id: 'ALM-2020-001', 
            year: '2020', 
            title: 'Global Chapters Expansion', 
            desc: 'Established active branches in major cities worldwide supporting graduates abroad. Facilitates localized mixers, alumni panels addressing international job placements support structures layout designs configs setups configurations workflow setups structs.', 
            img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop' 
        },
        { 
            id: 'ALM-2022-001', 
            year: '2022', 
            title: '5,000 Members Milestone', 
            desc: 'Reached over 5,000 active registered members contributing back with funding initiatives. Helps finance campus utilities endowments supporting upcoming nursing students setups layout designs absolute configs setups configurations triggers fixes setups configs designs.', 
            img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop' 
        },
    ];

    console.log('🎓 Seeding Alumni History...');
    for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        await pool.query(
            'REPLACE INTO alumni_milestones (id, year, title, description, imageUrl, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
            [m.id, m.year, m.title, m.desc, m.img, i]
        );
    }
    console.log(`✅ Seeded ${milestones.length} alumni milestones.`);
};
