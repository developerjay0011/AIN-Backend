import pool from '../config/db.js';

export const seedInstitutional = async () => {

    const toppers = [
        ['TOP-1774528140494','S Esthar Rani','#1','uploads/images/topper_1.jpeg','University Rank'],
        ['TOP-1774528142560','Payal Goswami','#6','uploads/images/topper_2.jpeg','University Rank'],
        ['TOP-1774528142704','Raksha Bishwas','#9','uploads/images/topper_3.jpeg','University Rank'],
        ['TOP-1774528143540','Kajol Jena','#11','uploads/images/topper_4.jpeg','University Rank'],
        ['TOP-1774528143629','Tanushree Samanta','#20','uploads/images/topper_5.jpeg','University Rank']
    ];

    const milestones = [
        ['ACH-1775885100001', 'Institute Founded', '2006', 'Institue', 'Army Institute of Nursing established at 151 Base Hospital, Basistha, Guwahati on August 1, 2006.'],
        ['ACH-1775885100002', 'INC Recognition', '2006', 'Academic', 'Recognized by Indian Nursing Council, New Delhi, validating our academic standards.'],
        ['ACH-1775885100003', 'State Affiliation', '2006', 'Compliance', "Approved by Assam Nurses' Midwives' & Health Visitors' Council, Guwahati."],
        ['ACH-1775885100004', 'University Affiliation (GU)', '2006', 'Academic', 'Initial affiliation with Gauhati University for formal academic certification.'],
        ['ACH-1775885100005', 'University Affiliation (SSUHS)', '2010', 'Academic', 'Affiliated to Srimanta Sankaradeva University of Health Sciences, Assam.'],
        ['ACH-1775885100006', 'M.Sc Programme Launch', '2015', 'Growth', 'Post-graduate nursing programme (M.Sc Nursing) successfully launched.']
    ];

    const aqars = [
        ['AQR-1774611122658','2024-2025','Annual Quality Assurance Report 2024-25','Comprehensive evaluation of academic and administrative quality parameters for the current academic cycle.','Submitted','2026-03-27','','N/A'],
        ['AQR-1774611218722','2023-2024','Annual Quality Assurance Report 2023-24','Detailed report covering curriculum excellence, research output, and student progression milestones.','Approved','2024-11-20','','N/A'],
        ['AQR-1774611308057','2022-2023','Annual Quality Assurance Report 2022-23','Yearly assessment focusing on infrastructure development and community outreach initiatives.','Approved','2023-12-15','','N/A'],
        ['AQR-1774611537195','2021-2022','Annual Quality Assurance Report 2021-22','Evaluation of digital learning adoption and faculty development programs during the post-pandemic transition.','Approved','2023-01-10','','N/A']
    ];

    const metrics = [
        ['MET-1775886100001','Award','Academic Excellence','Grade A','bg-emerald-50 text-emerald-600',1],
        ['MET-1775886100002','ShieldCheck','Compliance Rate','100%','bg-blue-50 text-blue-600',2],
        ['MET-1775886100003','PieChart','Research Growth','+24%','bg-gold/10 text-gold',3],
        ['MET-1775886100004','Award','New Metric','Value','bg-indigo-50 text-indigo-600 border-indigo-100',0]
    ];

    console.log('🏛️ Seeding Institutional Data...');
    
    for (const [id, n, r, img, tag] of toppers) {
        await pool.query(
            'REPLACE INTO toppers (id, name, rank, imageUrl, rankTag) VALUES (?, ?, ?, ?, ?)',
            [id, n, r, img, tag]
        );
    }

    for (const [id, t, d, c, ds] of milestones) {
        await pool.query(
            'REPLACE INTO achievements (id, title, date, category, description) VALUES (?, ?, ?, ?, ?)',
            [id, t, d, c, ds]
        );
    }

    for (const [id, y, t, d, s, dt, u, sz] of aqars) {
        await pool.query(
            'REPLACE INTO aqars (id, year, title, description, status, date, documentUrl, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, y, t, d, s, dt, u, sz]
        );
    }

    for (const [id, i, t, v, c, so] of metrics) {
        await pool.query(
            'REPLACE INTO quality_metrics (id, icon, title, value, color, sortOrder) VALUES (?, ?, ?, ?, ?, ?)',
            [id, i, t, v, c, so]
        );
    }

    console.log(`✅ Seeded ${toppers.length} toppers, ${aqars.length} reports, and ${metrics.length} metrics.`);
};
