import pool from '../config/db.js';

export const seedPublications = async () => {
    console.log('📚 Seeding Publications Data...');

    const publicationsData = [
        // Journals
        {
            type: 'journal',
            title: 'Advanced Nursing Practices in Rural Healthcare',
            author: 'Dr. Priya Sharma & Team',
            date: '2025',
            description: 'A comprehensive study on the efficacy of tele-nursing interventions in remote northeastern villages.',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            type: 'journal',
            title: 'Pediatric Care Protocols: A Modern Approach',
            author: 'Dr. Rohan Hazarika',
            date: '2024',
            description: 'Evaluating the impact of parent-assisted care models in pediatric intensive care units.',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            type: 'journal',
            title: 'Mental Health Stigma Among Nursing Professionals',
            author: 'Prof. Amrita Baruah',
            date: '2023',
            description: 'An analysis of psychological barriers to seeking mental health support among frontline clinical staff.',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },

        // Conferences
        {
            type: 'conference',
            title: 'Global Health Summit 2025',
            date: 'October 12-14, 2025',
            venue: 'International Convention Centre, New Delhi',
            speaker: 'Dr. Neeraj Patil (WHO)',
            topic: 'Future of Pandemic Preparedness'
        },
        {
            type: 'conference',
            title: 'National Symposium on Neonatal Nursing',
            date: 'April 05, 2025',
            venue: 'AIN Auditorium, Guwahati',
            speaker: 'Dr. Anjali Verma',
            topic: 'Innovations in Neonatal Resuscitation'
        },

        // Newsletters
        {
            type: 'newsletter',
            title: 'The AIN Chronicle - Q1 2026',
            date: 'March 2026',
            img: '/uploads/images/publication/newsletter-cover-1.jpg',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            type: 'newsletter',
            title: 'The AIN Chronicle - Q4 2025',
            date: 'December 2025',
            img: '/uploads/images/publication/newsletter-cover-2.jpg',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            type: 'newsletter',
            title: 'The AIN Chronicle - Q3 2025',
            date: 'September 2025',
            img: '/uploads/images/publication/newsletter-cover-3.jpg',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },

        // Magazines
        {
            type: 'magazine',
            title: "Nightingale's Lamp - Annual 2025",
            date: 'January 2026',
            img: '/uploads/images/publication/magazine-cover-1.jpg',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },
        {
            type: 'magazine',
            title: "Nightingale's Lamp - Annual 2024",
            date: 'January 2025',
            img: '/uploads/images/publication/magazine-cover-2.jpg',
            fileUrl: '/uploads/documents/general/dummy.pdf'
        },

        // Faculty
        {
            type: 'faculty',
            title: 'Dr. Sanjay Kalita Publications',
            author: 'Dr. Sanjay Kalita',
            initials: 'SK',
            department: 'Community Health Nursing',
            papers: JSON.stringify([
                'Community-based Rehabilitation Models (2025)',
                'Maternal Nutrition Indices (2024)'
            ])
        },
        {
            type: 'faculty',
            title: 'Mrs. Sangeeta Das Publications',
            author: 'Mrs. Sangeeta Das',
            initials: 'SD',
            department: 'Obstetrics & Gynaecological Nursing',
            papers: JSON.stringify([
                'Midwifery Practices in Assam (2025)',
                'Postpartum Depression Screening (2023)'
            ])
        },
        {
            type: 'faculty',
            title: 'Dr. Pallav Bora Publications',
            author: 'Dr. Pallav Bora',
            initials: 'PB',
            department: 'Medical-Surgical Nursing',
            papers: JSON.stringify([
                'Perioperative Nursing Standards (2025)',
                'Pain Management Strategies (2024)'
            ])
        }
    ];

    for (const pub of publicationsData) {
        await pool.query(
            `INSERT INTO publications (
                type, title, author, initials, department, date, venue, speaker, topic, description, img, fileUrl, papers
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pub.type,
                pub.title,
                pub.author || null,
                pub.initials || null,
                pub.department || null,
                pub.date || null,
                pub.venue || null,
                pub.speaker || null,
                pub.topic || null,
                pub.description || null,
                pub.img || null,
                pub.fileUrl || null,
                pub.papers || null
            ]
        );
    }
    console.log(`✅ Seeded ${publicationsData.length} publications.`);
};
