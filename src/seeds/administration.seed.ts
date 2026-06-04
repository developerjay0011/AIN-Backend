import pool from '../config/db.js';

export const seedAdministration = async () => {
    const members = [
        {
            id: 'director',
            name: 'Brig Ajit Kumar Borah, VSM (Retd)',
            designation: 'Director, AIN Guwahati',
            imageUrl: '/uploads/images/about/director.jpeg',
            qualification: 'Brigadier (Retd), Indian Army',
            experience: '35+ Years in Operations & Administration',
            specialization: 'Strategic Operations, Crisis Management, Institutional Governance',
            quote: 'Discipline, execution excellence, and welfare form the foundation of our institution.',
            description: 'Brig Ajit Kumar Borah, VSM (Retd) leads the administrative, financial, and strategic direction of the Army Institute of Nursing, Guwahati. With a highly decorated military career, he oversees infrastructure projects, coordinates with government/defense authorities, and ensures that the college runs with military-grade precision and efficiency.',
            sortOrder: 0,
            isLinked: true,
            staffId: 'STF-1775881000101'
        },
        {
            id: 'principal',
            name: 'Prof. Kabita Baishya',
            designation: 'Officiating Principal, AIN Guwahati',
            imageUrl: '/uploads/images/about/principal.jpeg',
            qualification: 'M.Sc Nursing, Ph.D Scholar',
            experience: '25+ Years in Nursing Education',
            specialization: 'Medical Surgical Nursing, Academic Governance',
            quote: 'Our goal is to shape nurses who are not just clinically competent but are equipped with moral values and a spirit of selfless service.',
            description: 'Prof. Kabita Baishya is the academic lead of AIN Guwahati. She is responsible for curricular design, faculty development, affiliation and compliance audits, and maintaining the highest standard of classroom and clinical instruction. Under her leadership, the institute has maintained a record of 100% academic pass rates and national distinctions.',
            sortOrder: 1,
            isLinked: true,
            staffId: 'STF-1775881000001'
        },
        {
            id: 'vice-principal',
            name: 'Lt Col (Mrs.) P. Singh',
            designation: 'Vice Principal, AIN Guwahati',
            imageUrl: null,
            qualification: 'M.Sc Nursing, Lt Col (Retd)',
            experience: '20+ Years in Military Nursing Service (MNS)',
            specialization: 'Community Health Nursing, Clinical Supervision',
            quote: 'Bridging the gap between academic theory and rigorous clinical practice.',
            description: 'Lt Col (Mrs.) P. Singh assists the Principal in managing the academic and clinical curriculum. Drawing from her extensive background in the Military Nursing Service (MNS), she directly supervises clinical rotations at base hospitals, monitors student welfare, manages disciplinary codes, and ensures students get hands-on training that matches modern hospital protocols.',
            sortOrder: 2,
            isLinked: false,
            staffId: null
        },
        {
            id: 'registrar',
            name: 'Col Jyoti Prasad Saikia (Retd)',
            designation: 'Registrar, AIN Guwahati',
            imageUrl: '/uploads/images/about/registrar.jpeg',
            qualification: 'Colonel (Retd), Indian Army',
            experience: '30+ Years in Administration & Logistics',
            specialization: 'Security, Human Resources, Financial Operations',
            quote: 'Providing a secure, seamless, and highly supportive ecosystem for our campus community.',
            description: 'Col Jyoti Prasad Saikia (Retd) manages the day-to-day administrative operations, estate security, accounts, admissions processing, and non-teaching personnel. He ensures that campus resources, student hostels, transport services, and technological infrastructure are optimized to support the core academic and medical goals of AIN.',
            sortOrder: 3,
            isLinked: true,
            staffId: 'STF-1775881000102'
        }
    ];

    console.log('🏛️ Seeding Administration Members...');
    for (const m of members) {
        await pool.query(
            `REPLACE INTO administration_members (id, name, designation, imageUrl, qualification, experience, specialization, quote, description, sortOrder, isLinked, staffId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [m.id, m.name, m.designation, m.imageUrl, m.qualification, m.experience, m.specialization, m.quote, m.description, m.sortOrder, m.isLinked, m.staffId]
        );
    }
    console.log(`✅ Seeded ${members.length} administration members.`);
};
