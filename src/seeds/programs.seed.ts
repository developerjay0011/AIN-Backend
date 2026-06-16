import pool from '../config/db.js';

export const seedPrograms = async () => {
    const programsData = [
        {
            id: 'prog-undergrad',
            name: 'Undergraduate',
            description: 'Core bachelor degree programs in nursing providing clinical training and healthcare education.',
            courses: [
                {
                    id: 'course-bsc-nursing',
                    title: 'B.Sc. Nursing',
                    description: 'A 4-year undergraduate program focusing on nursing, clinical practice, and health sciences.',
                    image: '/uploads/unsplash_photo-1576091160550-2173dba999ef.jpg'
                },
                {
                    id: 'course-post-basic-bsc',
                    title: 'Post Basic B.Sc. Nursing',
                    description: 'A 2-year program designed to upgrade diploma nursing students to bachelor level.',
                    image: '/uploads/unsplash_photo-1527689368864-3a821dbccc34.jpg'
                },
                {
                    id: 'course-bsc-hons',
                    title: 'B.Sc. Nursing (Honours)',
                    description: 'Advanced undergraduate study with specialized focus on healthcare leadership, ethics, and research methodologies.',
                    image: '/uploads/unsplash_photo-1581578731548-c64695cc6952.jpg'
                }
            ]
        },
        {
            id: 'prog-postgrad',
            name: 'Postgraduate',
            description: 'Advanced master level nursing programs for specialization and leadership in clinical environments.',
            courses: [
                {
                    id: 'course-msc-medsurg',
                    title: 'M.Sc. Medical Surgical Nursing',
                    description: 'A 2-year postgraduate course focusing on advanced care of adult patients with medical-surgical conditions.',
                    image: '/uploads/unsplash_photo-1516321318423-f06f85e504b3.jpg'
                },
                {
                    id: 'course-msc-obg',
                    title: 'M.Sc. Obstetrical & Gynaecological Nursing',
                    description: 'A 2-year postgraduate program focusing on maternal, neonatal health, and advanced midwifery practices.',
                    image: '/uploads/unsplash_photo-1531844703901-f8585222b47a.jpg'
                },
                {
                    id: 'course-msc-psych',
                    title: 'M.Sc. Psychiatric Nursing',
                    description: 'A 2-year postgraduate program specializing in mental health assessment, therapy, and psychiatric patient care.',
                    image: '/uploads/unsplash_photo-1506126613408-eca07ce68773.jpg'
                }
            ]
        },
        {
            id: 'prog-phd',
            name: 'Ph.D. Programs',
            description: 'Doctoral research programs aiming to produce scholars and nursing researchers.',
            courses: [
                {
                    id: 'course-phd-practice',
                    title: 'Ph.D. in Clinical Nursing Practice',
                    description: 'Advanced doctoral degree focusing on clinical practice-oriented research, quality improvement, and evidence-based practice.',
                    image: '/uploads/unsplash_photo-1434030216411-0b793f4b4173.jpg'
                },
                {
                    id: 'course-phd-education',
                    title: 'Ph.D. in Nursing Education',
                    description: 'Doctoral research focused on pedagogical methods, curriculum design, and assessment in nursing education.',
                    image: '/uploads/unsplash_photo-1454165804606-c3d57bc86b40.jpg'
                },
                {
                    id: 'course-phd-policy',
                    title: 'Ph.D. in Healthcare Policy & Leadership',
                    description: 'Doctoral research program analyzing public health policy, systems engineering, and strategic healthcare leadership.',
                    image: '/uploads/unsplash_photo-1551836022-d5d88e9218df.jpg'
                }
            ]
        },
        {
            id: 'prog-diploma',
            name: 'Diploma Programs',
            description: 'Skill-based diploma courses to kickstart a professional career in clinical care.',
            courses: [
                {
                    id: 'course-gnm',
                    title: 'General Nursing and Midwifery (GNM)',
                    description: 'A 3-year diploma course preparing general nurses to work as key members of healthcare teams.',
                    image: '/uploads/unsplash_photo-1505751172876-fa1923c5c528.jpg'
                },
                {
                    id: 'course-anm',
                    title: 'Auxiliary Nurse Midwifery (ANM)',
                    description: 'A 2-year diploma program focusing on basic health care, maternal care, and community nursing services.',
                    image: '/uploads/unsplash_photo-1576765608535-5f04d1e3f289.jpg'
                },
                {
                    id: 'course-dip-pediatric',
                    title: 'Diploma in Pediatric Nursing Care',
                    description: 'A 1.5-year specialized diploma focusing on pediatric care, child development, and immunization programs.',
                    image: '/uploads/unsplash_photo-1516627145497-ae6968895b74.jpg'
                }
            ]
        },
        {
            id: 'prog-pg-diploma',
            name: 'PG Diploma Programs',
            description: 'Postgraduate diplomas focusing on super-speciality medical and surgical care areas.',
            courses: [
                {
                    id: 'course-critical-care',
                    title: 'Post Basic Diploma in Critical Care Nursing',
                    description: 'A 1-year specialty program training nurses to handle complex patient situations in ICUs.',
                    image: '/uploads/unsplash_photo-1584515979956-d9f6e5d09982.jpg'
                },
                {
                    id: 'course-emergency-disaster',
                    title: 'Post Basic Diploma in Emergency & Disaster Nursing',
                    description: 'A 1-year course for quick response, trauma care, triage, and disaster management.',
                    image: '/uploads/unsplash_photo-1516574187841-cb9cc2ca948b.jpg'
                },
                {
                    id: 'course-neonatal-nursing',
                    title: 'Post Basic Diploma in Neonatal Nursing',
                    description: 'A 1-year specialized training program focusing on intensive care for premature and sick newborns.',
                    image: '/uploads/unsplash_photo-1502740479796-61c93207596a.jpg'
                }
            ]
        },
        {
            id: 'prog-certificate',
            name: 'Certificate Courses',
            description: 'Short term specialized certificate training programs for continuous professional development.',
            courses: [
                {
                    id: 'course-cch',
                    title: 'Certificate in Community Health (CCH)',
                    description: 'A 6-month program focusing on community diagnostics, public health and maternal healthcare.',
                    image: '/uploads/unsplash_photo-1488521787991-ed7bbaae773c.jpg'
                },
                {
                    id: 'course-geriatric-care',
                    title: 'Certificate in Geriatric Care Nursing',
                    description: 'A 3-month certificate course training professionals in aged care, palliative care, and chronic illness management.',
                    image: '/uploads/unsplash_photo-1576765608622-06b98ea410a2.jpg'
                },
                {
                    id: 'course-infection-control',
                    title: 'Certificate in Infection Control & Prevention',
                    description: 'A 4-month program teaching hospital hygiene, sterilization techniques, and infectious disease management.',
                    image: '/uploads/unsplash_photo-1579154204601-01588f351167.jpg'
                }
            ]
        }
    ];

    console.log('🎓 Seeding Programs & Courses...');
    
    // Clear existing programs/courses first to prevent primary key collisions on reseed
    await pool.query('DELETE FROM courses WHERE id LIKE "course-%"');
    await pool.query('DELETE FROM programs WHERE id LIKE "prog-%"');

    for (const p of programsData) {
        await pool.query(
            'INSERT INTO programs (id, name, description) VALUES (?, ?, ?)',
            [p.id, p.name, p.description]
        );

        for (const c of p.courses) {
            await pool.query(
                'INSERT INTO courses (id, programId, title, description, image) VALUES (?, ?, ?, ?, ?)',
                [c.id, p.id, c.title, c.description, c.image]
            );
        }
    }

    console.log(`✅ Seeded ${programsData.length} programs and associated courses.`);
};
