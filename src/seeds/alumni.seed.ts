import pool from '../config/db.js';

export const seedAlumni = async () => {
    // 1. History Milestones
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

    // 2. Activities
    const activities = [
        { id: 'ACT-001', title: 'Annual Alumni Meet 2025', date: 'Jan 15, 2025', desc: 'Over 300 graduates gathered to celebrate the 10th anniversary foundation chapter meets.', img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop' },
        { id: 'ACT-002', title: 'Mentorship Seminar', date: 'Dec 05, 2024', desc: 'Distinguished nurses conducting mentorship training sessions on advanced critical nursing feeds.', img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop' },
        { id: 'ACT-003', title: 'Health Camp Drive', date: 'Oct 20, 2024', desc: 'Collaborative local healthcare screening drive organized across nearby municipalities nodes.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop' }
    ];

    console.log('🎓 Seeding Alumni Activities...');
    for (const act of activities) {
        await pool.query(
            'REPLACE INTO alumni_activities (id, title, date, description, imageUrl) VALUES (?, ?, ?, ?, ?)',
            [act.id, act.title, act.date, act.desc, act.img]
        );
    }
    console.log(`✅ Seeded ${activities.length} alumni activities.`);

    // 3. Alumni Directory (Members)
    const members = [
        { id: 'MEM-001', name: 'Dr. Priya Sharma', batch: '2016', role: 'Chief Nursing Officer', location: 'New Delhi', company: 'Apollo Hospitals', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop', verified: true, linkedinUrl: 'https://linkedin.com', email: 'priya@apollo.com' },
        { id: 'MEM-002', name: 'Rahul Varma', batch: '2018', role: 'Staff Nurse - ICU', location: 'Mumbai', company: 'Fortis Healthcare', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop', verified: true, linkedinUrl: 'https://linkedin.com', email: 'rahul@fortis.com' },
        { id: 'MEM-003', name: 'Sneha Das', batch: '2017', role: 'Nurse Educator', location: 'Bangalore', company: 'Manipal Hospitals', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop', verified: false, linkedinUrl: 'https://linkedin.com', email: 'sneha@manipal.com' },
        { id: 'MEM-004', name: 'Amit Singh', batch: '2019', role: 'Nursing Director', location: 'Guwahati', company: 'GNRC Hospitals', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop', verified: true, linkedinUrl: 'https://linkedin.com', email: 'amit@gnrc.com' },
        { id: 'MEM-005', name: 'Anjali Desai', batch: '2016', role: 'Operations Manager', location: 'Hyderabad', company: 'KIMS Hospitals', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop', verified: true, linkedinUrl: 'https://linkedin.com', email: 'anjali@kims.com' },
        { id: 'MEM-006', name: 'Vikram Mehta', batch: '2018', role: 'Public Health Officer', location: 'Pune', company: 'WHO India', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop', verified: false, linkedinUrl: 'https://linkedin.com', email: 'vikram@who.org' },
        { id: 'MEM-007', name: 'Neelam Roy', batch: '2017', role: 'Clinical Specialist', location: 'Kolkata', company: 'Medanta', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop', verified: true, linkedinUrl: 'https://linkedin.com', email: 'neelam@medanta.com' },
        { id: 'MEM-008', name: 'Sanjay Kapoor', batch: '2019', role: 'Research Fellow', location: 'Chandigarh', company: 'AIIMS', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop', verified: true, linkedinUrl: 'https://linkedin.com', email: 'sanjay@aiims.edu' }
    ];

    console.log('🎓 Seeding Alumni Directory...');
    for (const mem of members) {
        await pool.query(
            'REPLACE INTO alumni_members (id, name, batch, role, location, company, imageUrl, verified, linkedinUrl, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [mem.id, mem.name, mem.batch, mem.role, mem.location, mem.company, mem.img, mem.verified ? 1 : 0, mem.linkedinUrl, mem.email]
        );
    }
    console.log(`✅ Seeded ${members.length} alumni directory members.`);

    // 4. Executives
    const executives = [
        { id: 'EXE-001', name: 'Prof. Amrita Baruah', role: 'President', batch: 'Class of 2011', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop', quote: "Our mission is to foster a lifelong bond between our members, providing a framework for professional growth, mutual support, and giving back to the institution that shaped our careers.", isHead: true, linkedinUrl: 'https://linkedin.com', email: 'president@alumni.com' },
        { id: 'EXE-002', name: 'Dr. Sanjay Kalita', role: 'Vice President', batch: 'Class of 2013', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop', quote: '', isHead: false, linkedinUrl: 'https://linkedin.com', email: 'vp@alumni.com' },
        { id: 'EXE-003', name: 'Mrs. Pinky Gogoi', role: 'General Secretary', batch: 'Class of 2012', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop', quote: '', isHead: false, linkedinUrl: 'https://linkedin.com', email: 'secretary@alumni.com' },
        { id: 'EXE-004', name: 'Mr. Dipankar Das', role: 'Treasurer', batch: 'Class of 2014', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop', quote: '', isHead: false, linkedinUrl: 'https://linkedin.com', email: 'treasurer@alumni.com' },
        { id: 'EXE-005', name: 'Ms. Juri Chetia', role: 'Joint Secretary', batch: 'Class of 2015', img: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&auto=format&fit=crop', quote: '', isHead: false, linkedinUrl: 'https://linkedin.com', email: 'jointsec@alumni.com' }
    ];

    console.log('🎓 Seeding Alumni Executives...');
    for (let i = 0; i < executives.length; i++) {
        const exe = executives[i];
        await pool.query(
            'REPLACE INTO alumni_executives (id, name, role, batch, imageUrl, quote, isHead, linkedinUrl, email, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [exe.id, exe.name, exe.role, exe.batch, exe.img, exe.quote || null, exe.isHead ? 1 : 0, exe.linkedinUrl || null, exe.email || null, i]
        );
    }
    console.log(`✅ Seeded ${executives.length} alumni executives.`);
};
