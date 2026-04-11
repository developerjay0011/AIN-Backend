import pool from '../config/db.js';

export const seedStaff = async () => {
    const records = [
        ['STF-1775881000001','Prof. Kabita Baishya','Officiating Principal','teaching','/uploads/images/1775884583295-935427351.jpg','M.Sc Nursing, Ph.D','25+ Years','Medical Surgical Nursing',''],
        ['STF-1775881000002','Lt Col (Mrs.) P. Singh','Vice Principal','teaching','/uploads/images/staff_2.jpg','M.Sc Nursing','20+ Years','Community Health Nursing',null],
        ['STF-1775881000003','Mrs. Anjali Sharma','Associate Professor','teaching','/uploads/images/staff_3.jpg','M.Sc Nursing','15 Years','OBG Nursing',null],
        ['STF-1775881000004','Ms. Priyanka Das','Assistant Professor','teaching','/uploads/images/staff_4.jpg','M.Sc Nursing','10 Years','Pediatric Nursing',null],
        ['STF-1775881000005','Mrs. Ritu Baruah','Tutor','teaching','/uploads/images/staff_5.jpg','B.Sc Nursing','5 Years','Clinical Nursing',null],
        ['STF-1775881000006','Ms. Sunita Gogoi','Tutor','teaching','/uploads/images/staff_6.jpg','B.Sc Nursing','4 Years','Mental Health Nursing',null],
        ['STF-1775881000007','Mrs. Karabi Das','Tutor','teaching','/uploads/images/staff_7.jpg','M.Sc Nursing','6 Years','Psychiatric Nursing',null],
        ['STF-1775881000008','Ms. Jumi Kalita','Clinical Instructor','teaching','/uploads/images/staff_8.jpg','B.Sc Nursing','3 Years','Community Nursing',null],
        ['STF-1775881000101','Brig Ajit Kumar Borah, VSM (Retd)','Director','non-teaching','/uploads/images/1775884704037-421757033.jpg','','','','Administration'],
        ['STF-1775881000102','Col Jyoti Prasad Saikia (Retd)','Registrar','non-teaching','/uploads/images/1775884816799-434522381.jpg','','','','Accounts & Admin'],
        ['STF-1775881000103','Mrs. Meena Kalita','Librarian','non-teaching','/uploads/images/staff_103.jpg',null,null,null,'Library'],
        ['STF-1775881000104','Mr. Bikash Saikia','IT Coordinator','non-teaching','/uploads/images/staff_104.jpg',null,null,null,'IT Support'],
        ['STF-1775881000105','Mrs. Deepa Rajbongshi','Warden','non-teaching','/uploads/images/staff_105.jpg',null,null,null,'Hostel Management'],
        ['STF-1775881000106','Mr. Sunil Thapa','Estate supervisor','non-teaching','/uploads/images/staff_106.jpg',null,null,null,'Facilities'],
        ['STF-1775881000107','Mr. Amit Baruah','Lab Assistant','non-teaching','/uploads/images/staff_107.jpg',null,null,null,'Nursing Labs'],
        ['STF-1775881000108','Ms. Sangita Rabha','Clerk','non-teaching','/uploads/images/staff_108.jpg',null,null,null,'Academic Section']
    ];

    console.log('🧑‍🏫 Seeding Staff...');
    for (const [id, name, role, type, image, qual, exp, spec, dept] of records) {
        await pool.query(
            `INSERT OR REPLACE INTO staff 
            (id, name, role, type, image, qualification, experience, specialization, department) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, role, type, image, qual, exp, spec, dept]
        );
    }
    console.log(`✅ Seeded ${records.length} staff members.`);
};
