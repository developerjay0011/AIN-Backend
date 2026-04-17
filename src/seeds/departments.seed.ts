import pool from '../config/db.js';

export const seedDepartments = async () => {
    const records = [
        {
            departmentId: 'child-health',
            name: 'Child Health Nursing',
            shortName: 'CHN',
            overview: 'The Department of Child Health Nursing focuses on the holistic care of children from neonatal stage through adolescence. Students gain in-depth knowledge of paediatric illnesses, growth & development, immunisation, and family-centred care.',
            areas: JSON.stringify([
                'Neonatal Nursing & Care of the Newborn',
                'Paediatric Medical & Surgical Nursing',
                'Growth Monitoring & Child Development',
                'Immunisation & Preventive Paediatrics',
                'Family-Centred & Community Child Care',
            ]),
            faculty: 3,
            clinicalHours: '480 hrs',
        },
        {
            departmentId: 'community-health',
            name: 'Community Health Nursing',
            shortName: 'ComHN',
            overview: 'The Department of Community Health Nursing equips students with the skills to deliver preventive, promotive, and rehabilitative healthcare services to the community. Emphasis is placed on primary healthcare, epidemiology, and community outreach programmes.',
            areas: JSON.stringify([
                'Primary Healthcare & District Health Systems',
                'Epidemiology & Disease Surveillance',
                'Maternal & Child Health in Community',
                'National Health Programmes',
                'Community Outreach & Home Visits',
            ]),
            faculty: 3,
            clinicalHours: '400 hrs',
        },
        {
            departmentId: 'msn',
            name: 'MSN – Medical Surgical Nursing',
            shortName: 'MSN',
            overview: 'The Medical-Surgical Nursing (MSN) department provides a strong evidence-based foundation in adult clinical nursing. Students are trained in managing patients with a wide range of medical and surgical conditions across hospital settings.',
            areas: JSON.stringify([
                'Fundamentals of Nursing Practice',
                'Medical Nursing – Systemic Disorders',
                'Surgical Nursing – Pre & Post-Operative Care',
                'Critical Care & Emergency Nursing',
                'Pharmacology & Drug Administration',
            ]),
            faculty: 4,
            clinicalHours: '560 hrs',
        },
        {
            departmentId: 'mhn',
            name: 'MHN – Mental Health Nursing',
            shortName: 'MHN',
            overview: 'The Mental Health Nursing (MHN) department prepares students to provide compassionate, evidence-based psychiatric and mental healthcare. The curriculum emphasises therapeutic communication, psychopathology, and community mental health.',
            areas: JSON.stringify([
                'Concepts of Mental Health & Illness',
                'Psychopathology & Clinical Psychiatry',
                'Therapeutic Relationships & Communication',
                'Psychopharmacology & Somatic Therapies',
                'Community Mental Health & Rehabilitation',
            ]),
            faculty: 2,
            clinicalHours: '320 hrs',
        },
        {
            departmentId: 'obg',
            name: 'OBG – Obstetric & Gynaecological Nursing',
            shortName: 'OBG',
            overview: 'The Obstetrics & Gynaecology Nursing (OBG) department trains students in the complete spectrum of women\'s health — from antenatal to postnatal care and gynaecological conditions. Students gain hands-on experience in labour wards and maternity units.',
            areas: JSON.stringify([
                'Antenatal, Intranatal & Postnatal Care',
                'Normal & Complicated Labour Management',
                'Neonatal Care & Breastfeeding Promotion',
                'Gynaecological Nursing & Reproductive Health',
                'High-Risk Pregnancy & Emergency Obstetrics',
            ]),
            faculty: 3,
            clinicalHours: '480 hrs',
        }
    ];

    console.log('🏥 Seeding Departments...');
    for (const d of records) {
        const id = `DEPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await pool.query(
            'REPLACE INTO departments (id, departmentId, name, shortName, overview, areas, faculty, clinicalHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, d.departmentId, d.name, d.shortName, d.overview, d.areas, d.faculty, d.clinicalHours]
        );
    }
    console.log(`✅ Seeded ${records.length} departments.`);
};
