import pool from '../config/db.js';

export const seedDepartments = async () => {
    const records = [
        {
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
            clinicalHours: '480 hrs',
            hod: 'Dr. Anita Sharma',
            facilities: JSON.stringify([
                'Paediatric Simulation Lab',
                'Child Development Clinic',
                'Neonatal Intensive Care Training Unit'
            ]),
            icon: 'Baby',
            color: 'from-blue-50 to-cyan-50 border-blue-100',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
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
            clinicalHours: '400 hrs',
            hod: 'Dr. Rajesh Patel',
            facilities: JSON.stringify([
                'Rural Health Training Centre',
                'Urban Health Post',
                'Mobile Health Unit'
            ]),
            icon: 'Users',
            color: 'from-green-50 to-emerald-50 border-green-100',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-700',
        },
        {
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
            clinicalHours: '560 hrs',
            hod: 'Mrs. Priya Devi',
            facilities: JSON.stringify([
                'Advanced Medical-Surgical Lab',
                'Clinical Skills Simulation Suite',
                'Emergency Nursing Training Cell'
            ]),
            icon: 'BookOpen',
            color: 'from-purple-50 to-violet-50 border-purple-100',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-700',
        },
        {

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
            clinicalHours: '320 hrs',
            hod: 'Dr. Sunita Barua',
            facilities: JSON.stringify([
                'Therapeutic Counseling Room',
                'Psychiatric Skill Lab',
                'Mental Health Counseling Helpline'
            ]),
            icon: 'Brain',
            color: 'from-rose-50 to-pink-50 border-rose-100',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
        },
        {
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
            clinicalHours: '480 hrs',
            hod: 'Mrs. Rimjhim Sharma',
            facilities: JSON.stringify([
                'Maternity Skills Lab',
                'Labour Room Simulator',
                'Antenatal Education Wing'
            ]),
            icon: 'Heart',
            color: 'from-orange-50 to-amber-50 border-orange-100',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
        }
    ];

    console.log('🏥 Seeding Departments...');
    let index = 1;
    for (const d of records) {
        const id = `depart_${index++}`;
        await pool.query(
            'REPLACE INTO departments (id, name, shortName, overview, areas, clinicalHours, hod, facilities, icon, color, iconBg, iconColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, d.name, d.shortName, d.overview, d.areas, d.clinicalHours, d.hod, d.facilities, d.icon, d.color, d.iconBg, d.iconColor]
        );
    }
    console.log(`✅ Seeded ${records.length} departments.`);
};
