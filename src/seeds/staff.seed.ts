import pool from '../config/db.js';

export const seedStaff = async () => {
    const records = [
        // ── CORE LEADERSHIP (Teaching & Non-Teaching) ──────────────────────────
        [
            'STF-1775881000101', // id
            'Brig Ajit Kumar Borah, VSM (Retd)', // name
            'Director, AIN Guwahati', // designation
            'non-teaching', // type
            '/uploads/images/about/director.jpeg', // image
            'Brigadier (Retd), Indian Army', // qualification
            '35+ Years in Operations & Administration', // experience
            'Strategic Operations, Crisis Management, Institutional Governance', // specialization
            null, // department
            'director', // section
            null, // role
            'Discipline, execution excellence, and welfare form the foundation of our institution.', // quote
            'Brig Ajit Kumar Borah, VSM (Retd) leads the administrative, financial, and strategic direction of the Army Institute of Nursing, Guwahati. With a highly decorated military career, he oversees infrastructure projects, coordinates with government/defense authorities, and ensures that the college runs with military-grade precision and efficiency.', // description
            0 // sortOrder
        ],
        [
            'STF-1775881000001',
            'Prof. Kabita Baishya',
            'Principal, AIN Guwahati',
            'teaching',
            '/uploads/images/about/principal.jpeg',
            'M.Sc Nursing, Ph.D Scholar',
            '25+ Years in Nursing Education',
            'Medical Surgical Nursing, Academic Governance',
            'depart_3',
            'principal',
            null,
            'Our goal is to shape nurses who are not just clinically competent but are equipped with moral values and a spirit of selfless service.',
            'Prof. Kabita Baishya is the academic lead of AIN Guwahati. She is responsible for curricular design, faculty development, affiliation and compliance audits, and maintaining the highest standard of classroom and clinical instruction. Under her leadership, the institute has maintained a record of 100% academic pass rates and national distinctions.',
            1
        ],
        [
            'STF-1775881000102',
            'Col Jyoti Prasad Saikia (Retd)',
            'Registrar & HOA, AIN Guwahati',
            'non-teaching',
            '/uploads/images/about/registrar.jpeg',
            'Colonel (Retd), Indian Army',
            '30+ Years in Administration & Logistics',
            'Security, Human Resources, Financial Operations',
            null,
            'registrar',
            null,
            'Providing a secure, seamless, and highly supportive ecosystem for our campus community.',
            'Col Jyoti Prasad Saikia (Retd) manages the day-to-day administrative operations, estate security, accounts, admissions processing, and non-teaching personnel. He ensures that campus resources, student hostels, transport services, and technological infrastructure are optimized to support the core academic and medical goals of AIN.',
            2
        ],

        // ── OTHER TEACHING FACULTY (Not in administration section) ──────────────
        [
            'STF-1775881000003',
            'Mrs. Anjali Sharma',
            'Associate Professor',
            'teaching',
            '/uploads/images/staff/staff_3.jpg',
            'M.Sc Nursing',
            '15 Years',
            'OBG Nursing',
            'depart_5',
            null, null, null, null, 11
        ],
        [
            'STF-1775881000004',
            'Ms. Priyanka Das',
            'Assistant Professor',
            'teaching',
            '/uploads/images/staff/staff_4.jpg',
            'M.Sc Nursing',
            '10 Years',
            'Pediatric Nursing',
            'depart_1',
            null, null, null, null, 12
        ],
        [
            'STF-1775881000005',
            'Mrs. Ritu Baruah',
            'Tutor',
            'teaching',
            '/uploads/images/staff/staff_5.jpg',
            'B.Sc Nursing',
            '5 Years',
            'Clinical Nursing',
            'depart_1',
            null, null, null, null, 13
        ],
        [
            'STF-1775881000006',
            'Ms. Sunita Gogoi',
            'Tutor',
            'teaching',
            '/uploads/images/staff/staff_6.jpg',
            'B.Sc Nursing',
            '4 Years',
            'Mental Health Nursing',
            'depart_4',
            null, null, null, null, 14
        ],
        [
            'STF-1775881000007',
            'Mrs. Karabi Das',
            'Tutor',
            'teaching',
            '/uploads/images/staff/staff_7.jpg',
            'M.Sc Nursing',
            '6 Years',
            'Psychiatric Nursing',
            'depart_4',
            null, null, null, null, 15
        ],

        // ── ACADEMIC STAFF (In Administration Manager) ─────────────────────────
        [
            'acad-001',
            'Mrs. Deepa Sharma',
            'M.Sc Nursing',
            'teaching',
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
        ],
        [
            'acad-002',
            'Mrs. Priya Devi',
            'M.Sc Nursing (Medical-Surgical)',
            'teaching',
            null,
            'M.Sc Nursing (Medical-Surgical)',
            '14 Years in Clinical Teaching',
            'Medical Surgical Nursing, Critical Care',
            null,
            'academic-staff',
            'Associate Professor',
            'Every patient is a teacher; every interaction is a lesson.',
            'Mrs. Priya Devi specialises in critical care nursing and leads the Medical Surgical department at AIN.',
            11
        ],
        [
            'acad-003',
            'Mrs. Rupa Gogoi',
            'M.Sc Nursing (Community Health)',
            'teaching',
            null,
            'M.Sc Nursing (Community Health)',
            '12 Years in Community Health Nursing',
            'Community Health, Public Health Nursing',
            null,
            'academic-staff',
            'Associate Professor',
            'Health is a community responsibility — nurses are its champions.',
            'Mrs. Rupa Gogoi leads community health outreach programs and coordinates field practicals for final-year nursing students.',
            12
        ],
        [
            'acad-004',
            'Mrs. Anita Bora',
            'M.Sc Nursing (Paediatrics)',
            'teaching',
            null,
            'M.Sc Nursing (Paediatrics)',
            '10 Years in Teaching & Clinical Practice',
            'Paediatric Nursing, Child Health',
            null,
            'academic-staff',
            'Assistant Professor',
            'Caring for children is the most rewarding form of nursing practice.',
            'Mrs. Anita Bora teaches paediatric nursing and supervises students at the Base Hospital Paediatric Ward.',
            13
        ],
        [
            'acad-005',
            'Ms. Rekha Nath',
            'M.Sc Nursing (Psychiatric)',
            'teaching',
            null,
            'M.Sc Nursing (Psychiatric)',
            '8 Years in Mental Health Nursing',
            'Psychiatric Nursing, Mental Health',
            null,
            'academic-staff',
            'Assistant Professor',
            'Mental health care is as vital as physical care — we must treat the whole person.',
            'Ms. Rekha Nath teaches psychiatric nursing and conducts awareness workshops on mental health at Base Hospital.',
            14
        ],
        [
            'acad-006',
            'Mrs. Sunita Kalita',
            'B.Sc Nursing, M.Sc Nursing (Pursuing)',
            'teaching',
            null,
            'B.Sc Nursing, M.Sc Nursing (Pursuing)',
            '5 Years in Nursing Education',
            'Fundamentals of Nursing, Basic Life Support',
            null,
            'academic-staff',
            'Tutor',
            'Strong fundamentals create confident nurses.',
            'Mrs. Sunita Kalita teaches foundational nursing skills and organises clinical simulation labs for first-year students.',
            15
        ],
        [
            'acad-007',
            'Mr. Bipul Das',
            'B.Sc Nursing',
            'teaching',
            null,
            'B.Sc Nursing',
            '4 Years in Nursing Education',
            'Anatomy & Physiology, Clinical Skills',
            null,
            'academic-staff',
            'Tutor',
            'Understanding the human body is the first step to healing it.',
            'Mr. Bipul Das teaches anatomy, physiology, and assists in clinical laboratory practicals.',
            16
        ],
        [
            'acad-008',
            'Mrs. Jayashree Baruah',
            'MCA, B.Sc Computer Science',
            'teaching',
            null,
            'MCA, B.Sc Computer Science',
            '9 Years in IT Education',
            'Healthcare IT, Computer Applications, Data Management',
            null,
            'academic-staff',
            'Computer Instructor',
            'Technology is the future of healthcare — nurses must be digitally fluent.',
            'Mrs. Jayashree Baruah manages the computer lab and teaches health informatics, computer applications, and digital documentation to nursing students.',
            17
        ],
        [
            'acad-009',
            'Mr. Rajan Kumar',
            'B.Tech (IT), CCNA Certified',
            'teaching',
            null,
            'B.Tech (IT), CCNA Certified',
            '7 Years in Network Administration',
            'Network Infrastructure, IT Security, System Administration',
            null,
            'academic-staff',
            'IT Supervisor / Network Administrator',
            'A connected campus is a productive campus.',
            'Mr. Rajan Kumar manages the campus IT infrastructure, maintains the LAN/WAN network, and supports digital learning tools used by faculty and students.',
            18
        ],
        [
            'acad-010',
            'Mrs. Pallabi Dutta',
            'B.Sc Computer Science',
            'teaching',
            null,
            'B.Sc Computer Science',
            '3 Years in Lab Management',
            'Computer Lab Management, IT Support',
            null,
            'academic-staff',
            'Computer Lab Assistant',
            'A well-maintained lab is the backbone of practical learning.',
            'Mrs. Pallabi Dutta assists students in computer lab sessions and maintains all lab equipment and software.',
            19
        ],
        [
            'STF-1775881000103',
            'Mrs. Meena Kalita',
            'Librarian',
            'teaching',
            '/uploads/images/staff/staff_103.jpg',
            'B.Lib Science',
            '15+ Years in Library Management',
            'Library Administration, Archiving, Resource Cataloguing',
            null,
            'academic-staff',
            'Librarian',
            'A library is not a luxury but one of the necessities of life.',
            'Mrs. Meena Kalita manages the main library collection and services, assisting students and faculty in accessing academic journals, textbooks, and digital reference systems.',
            20
        ],
        [
            'acad-011',
            'Mr. Hemanta Deka',
            'M.Lib Information Science',
            'teaching',
            null,
            'M.Lib Information Science',
            '6 Years in Library Services',
            'Digital Library, Cataloguing, Reference Services',
            null,
            'academic-staff',
            'Assistant Librarian',
            'A good library is a bridge between the student and the world of knowledge.',
            'Mr. Hemanta Deka manages cataloguing, digital library access, and reference services, ensuring students have timely access to academic resources.',
            21
        ],
        [
            'acad-012',
            'Ms. Barnali Das',
            'B.Lib Science',
            'teaching',
            null,
            'B.Lib Science',
            '4 Years',
            'Book Issuing, Library Maintenance',
            null,
            'academic-staff',
            'Library Attendent',
            '',
            'Ms. Barnali Das assists students in locating books and manages the daily issue and return of library resources.',
            22
        ],
        [
            'acad-013',
            'Mr. Sanjib Borah',
            'B.Sc (Life Sciences)',
            'teaching',
            null,
            'B.Sc (Life Sciences)',
            '5 Years in Lab Assistance',
            'Lab Equipment Maintenance, Specimen Preparation',
            null,
            'academic-staff',
            'Laboratory Attendent',
            '',
            'Mr. Sanjib Borah ensures all nursing skill labs are properly equipped, maintained, and ready for student practicals.',
            23
        ],
        [
            'acad-014',
            'Mr. Dulal Choudhury',
            'ITI Certificate',
            'teaching',
            null,
            'ITI Certificate',
            '3 Years',
            'Equipment Setup, Lab Support',
            null,
            'academic-staff',
            'Lab Assistant',
            '',
            'Mr. Dulal Choudhury supports faculty and students during lab sessions, prepares equipment, and maintains laboratory cleanliness and safety.',
            24
        ],

        // ── ADMINISTRATIVE STAFF (In Administration Manager) ─────────────────────
        [
            'admin-001',
            'Mr. Rajib Saikia',
            'B.Com, PG Diploma in Administration',
            'non-teaching',
            null,
            'B.Com, Post Graduate Diploma in Administration',
            '20 Years in Administrative Services',
            'Office Management, Record Keeping, Government Correspondence',
            null,
            'admin-staff',
            'Office Superintendent / Head Clerk',
            'Efficient administration is the silent engine behind every successful institution.',
            'Mr. Rajib Saikia manages the institute\'s administrative office, oversees clerical staff, and ensures all official communications, records, and documentation are maintained with accuracy and timeliness.',
            30
        ],
        [
            'admin-002',
            'Mr. Dhiraj Mahanta',
            'B.A, Diploma in Hostel Management',
            'non-teaching',
            null,
            'B.A, Diploma in Hostel Management',
            '12 Years in Hostel Administration',
            'Student Welfare, Hostel Discipline, Safety Management',
            null,
            'admin-staff',
            'Hostel Warden',
            'A safe and nurturing hostel environment shapes responsible professionals.',
            'Mr. Dhiraj Mahanta oversees the student hostel facility, ensuring cleanliness, discipline, safety, and the overall well-being of residential students.',
            31
        ],
        [
            'admin-003',
            'Mr. Nayan Barua',
            'M.Com, CA Inter',
            'non-teaching',
            null,
            'M.Com, CA Inter',
            '15 Years in Financial Administration',
            'Budget Management, Audit Compliance, Payroll',
            null,
            'admin-staff',
            'Accountant',
            'Transparent finances build lasting institutional trust.',
            'Mr. Nayan Barua manages the institute\'s financial records, salary disbursements, fee collections, audit reports, and compliance with government financial regulations.',
            32
        ],
        [
            'admin-004',
            'Mr. Bhupen Kalita',
            'Diploma in Civil Engineering',
            'non-teaching',
            null,
            'Diploma in Civil Engineering',
            '10 Years in Estate Management',
            'Infrastructure Maintenance, Facility Management',
            null,
            'admin-staff',
            'Estate Supervisor',
            'A well-maintained campus reflects the pride of its people.',
            'Mr. Bhupen Kalita supervises all estate and infrastructure activities including building maintenance, utilities, and campus facilities upkeep.',
            33
        ],
        [
            'admin-005',
            'Mrs. Kaberi Gogoi',
            'B.A, Diploma in Office Management',
            'non-teaching',
            null,
            'B.A, Diploma in Office Management',
            '8 Years in Front Office Operations',
            'Visitor Management, Communication, Front Desk Operations',
            null,
            'admin-staff',
            'Receptionist',
            'Every visitor deserves a warm and professional welcome.',
            'Mrs. Kaberi Gogoi manages the front office, greets visitors, handles incoming communications, and coordinates appointments for the administrative office.',
            34
        ],
        [
            'admin-006',
            'Mr. Pronab Das',
            'B.A, Shorthand & Typing Certificate',
            'non-teaching',
            null,
            'B.A, Shorthand & Typing Certificate',
            '11 Years as Personal Assistant',
            'Stenography, Documentation, Scheduling',
            null,
            'admin-staff',
            'PA / Stenographer',
            'Precision in documentation underpins effective leadership.',
            'Mr. Pronab Das serves as Personal Assistant to the Director, managing correspondence, scheduling, and confidential documentation.',
            35
        ]
    ];

    console.log('🧑‍🏫 Seeding Staff...');
    for (const [id, name, designation, type, image, qual, exp, spec, dept, section, role, quote, description, sortOrder] of records) {
        const resolvedType = type === 'teaching' ? 'academic-staff' : type === 'non-teaching' ? 'admin-staff' : type;
        await pool.query(
            `REPLACE INTO staff 
            (id, name, designation, type, image, qualification, experience, specialization, department, section, role, quote, description, sortOrder) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, designation, resolvedType, image, qual, exp, spec, dept, section, role, quote, description, sortOrder]
        );
    }
    console.log(`✅ Seeded ${records.length} staff members.`);
};
