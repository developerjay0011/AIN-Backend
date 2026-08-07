import pool from '../config/db.js';

const mscNursingCalendar = [
  { sl: 1, activity: 'Orientation Program for I year', from: '01.09.25', to: '06.09.25' },
  { sl: 2, activity: 'Theory Block for I year', from: '09.09.25', to: '15.11.25' },
  { sl: 3, activity: 'ANP (Clinical) Posting for I year', from: '17.11.25', to: '13.12.25' },
  { sl: 4, activity: 'Orientation Program for II year', from: '17.11.25', to: '22.11.25' },
  { sl: 5, activity: 'Theory Block for II year', from: '24.11.25', to: '13.12.25' },
  { sl: 6, activity: 'ANP (Community) Posting for I year / Theory Block for II year', from: '15.12.25', to: '27.12.25' },
  { sl: 7, activity: 'Winter Vacation for I year & II year', from: '29.12.25', to: '10.01.26' },
  { sl: 8, activity: 'Clinical Specialty posting for I year / Theory Block for II year', from: '12.01.26', to: '24.01.26' },
  { sl: 9, activity: 'Clinical Specialty posting for I year / Research Permission & I Term for II year', from: '26.01.26', to: '31.01.26' },
  { sl: 10, activity: 'Clinical Specialty posting for I year / Tool Validation for II year', from: '02.02.26', to: '14.02.26' },
  { sl: 11, activity: 'Nursing Research practical for I year / Clinical Specialty posting for II year', from: '16.02.26', to: '28.02.26' },
  { sl: 12, activity: 'Mid-term exam for I year / Clinical Specialty posting for II year', from: '02.03.26', to: '07.03.26' },
  { sl: 13, activity: 'Nursing Research practical for I year / Clinical Specialty posting for II year', from: '09.03.26', to: '14.03.26' },
  { sl: 14, activity: 'Nursing Education Practical for I year / Research Work for II year', from: '16.03.26', to: '21.03.26' },
  { sl: 15, activity: 'Nursing Education Practical for I year / Pilot Study for II year', from: '23.03.26', to: '28.03.26' },
  { sl: 16, activity: 'Nursing Education Practical for I year / Clinical Specialty posting for II year', from: '30.03.26', to: '11.04.26' },
  { sl: 17, activity: 'Clinical Specialty posting for I year / Clinical Specialty posting for II year', from: '13.04.26', to: '25.04.26' },
  { sl: 18, activity: 'Clinical Specialty posting for I year / Pilot study presentation for II year', from: '27.04.26', to: '02.04.26' },
  { sl: 19, activity: 'Clinical Specialty posting for I year / Main Study Data Collection for II year', from: '04.04.26', to: '30.04.26' },
  { sl: 20, activity: 'Clinical Specialty posting for I year / Research work & Mid term exam for II year', from: '01.06.26', to: '06.04.26' },
  { sl: 21, activity: 'Clinical Specialty posting for I year / Nursing Management Posting for II year', from: '08.06.26', to: '27.04.26' },
  { sl: 22, activity: 'Theory Block for I year / Nursing Management Posting for II year', from: '29.06.26', to: '04.07.26' },
  { sl: 23, activity: 'Theory Block for I year / Clinical Specialty posting for II year', from: '06.07.26', to: '25.07.26' },
  { sl: 24, activity: 'Pre-final Exam for I year / Clinical Specialty posting for II year', from: '27.07.26', to: '01.08.26' },
  { sl: 25, activity: 'Theory Block (revision) for I year / Clinical Specialty posting for II year', from: '03.08.26', to: '15.08.26' },
  { sl: 26, activity: 'Preparatory Leave for I year / Clinical Specialty posting for II year', from: '17.08.26', to: '22.08.26' },
  { sl: 27, activity: 'University Exam for I year / Clinical Specialty posting for II year', from: '24.08.26', to: '29.08.26' },
  { sl: 28, activity: 'Final research presentation for II year', from: '31.08.26', to: '05.09.26' },
  { sl: 29, activity: 'Theory Block (Revision) for II year', from: '07.09.26', to: '12.09.26' },
  { sl: 30, activity: 'Clinical Specialty posting for II year', from: '14.09.26', to: '17.10.26' },
  { sl: 31, activity: 'Theory block (Revision) for II year', from: '14.10.26', to: '19.10.26' },
  { sl: 32, activity: 'Pre-final Exam for II year', from: '26.10.26', to: '31.10.26' },
  { sl: 33, activity: 'Preparatory leave for II year', from: '02.11.26', to: '07.11.26' },
  { sl: 34, activity: 'University exam for II year', from: '09.11.26', to: '14.11.26' },
];

const bscSem1Calendar = [
  { sl: 1, activity: 'Orientation Program', from: '15/09/25', to: '20/09/25', weeks: '1 wk' },
  { sl: 2, activity: 'Theory Block', from: '22/09/25', to: '25/10/25', weeks: '5 wks' },
  { sl: 3, activity: 'College Week', from: '27/10/25', to: '01/11/25', weeks: '1 wk' },
  { sl: 4, activity: 'Theory Block', from: '03/11/25', to: '06/12/25', weeks: '4–5 wks' },
  { sl: 5, activity: 'I Term / Theory Block', from: '08/12/25', to: '13/12/25', weeks: '1 wk' },
  { sl: 6, activity: 'Theory Block / Skill Lab', from: '15/12/25', to: '27/12/25', weeks: '2 wks' },
  { sl: 7, activity: 'Vacation', from: '29/12/25', to: '17/01/26', weeks: '3 wks' },
  { sl: 8, activity: 'Partial Clinical Block / Skill Lab', from: '19/01/26', to: '07/02/26', weeks: '3 wks' },
  { sl: 9, activity: 'Partial Clinical Block / Skill Lab / II Term', from: '09/02/26', to: '14/02/26', weeks: '1 wk' },
  { sl: 10, activity: 'Prefinal Exam', from: '16/02/26', to: '21/02/26', weeks: '1 wk' },
  { sl: 11, activity: 'Theory Block', from: '23/02/26', to: '28/02/26', weeks: '1 wk' },
  { sl: 12, activity: 'Preparatory Leave', from: '02/03/26', to: '07/03/26', weeks: '1 wk' },
  { sl: 13, activity: 'University Exam', from: '09/03/26', to: '14/03/26', weeks: '1 wk' },
];

const bscSem2Calendar = [
  { sl: 1, activity: 'Orientation Program / Theory Block', from: '10/03/25', to: '05/04/25', weeks: '4 wks' },
  { sl: 2, activity: '1st Sessional Exam / Theory Block', from: '07/04/25', to: '19/04/25', weeks: '2 wks' },
  { sl: 3, activity: 'Theory Block', from: '21/04/25', to: '03/05/25', weeks: '2 wks' },
  { sl: 4, activity: 'Clinical Posting', from: '05/05/25', to: '21/06/25', weeks: '7 wks' },
  { sl: 5, activity: 'Clinical Posting / Second Sessional Exam', from: '23/05/25', to: '05/07/25', weeks: '2 wks' },
  { sl: 6, activity: 'Vacation', from: '07/07/25', to: '26/07/25', weeks: '3 wks' },
  { sl: 7, activity: 'Theory Block', from: '28/07/25', to: '02/08/25', weeks: '1 wk' },
  { sl: 8, activity: 'Pre-final Exam', from: '04/08/25', to: '09/08/25', weeks: '1 wk' },
  { sl: 9, activity: 'Theory Block', from: '11/08/25', to: '23/08/25', weeks: '1 wk' },
  { sl: 10, activity: 'Preparatory Leave', from: '25/08/25', to: '30/08/25', weeks: '1 wk' },
  { sl: 11, activity: 'University Exam', from: '01/09/25', to: '06/09/25', weeks: '1 wk' },
];

const bscSem4Calendar = [
  { sl: 1, activity: 'Orientation / Theory Block', from: '02/06/25', to: '08/06/25', weeks: '1 wk' },
  { sl: 2, activity: 'Theory Block', from: '09/06/25', to: '06/07/25', weeks: '4 wks' },
  { sl: 3, activity: 'Vacation', from: '07/07/25', to: '27/07/25', weeks: '3 wks' },
  { sl: 4, activity: 'Theory Block / Periodic Exam', from: '28/07/25', to: '03/08/25', weeks: '1 wk' },
  { sl: 5, activity: 'Clinical Posting', from: '04/08/25', to: '05/10/25', weeks: '9 wks' },
  { sl: 6, activity: 'Theory Block / Mid Term Exam', from: '06/10/25', to: '12/10/25', weeks: '1 wk' },
  { sl: 7, activity: 'Clinical Posting', from: '13/10/25', to: '26/10/25', weeks: '2 wks' },
  { sl: 8, activity: 'Theory Block', from: '27/10/25', to: '09/11/25', weeks: '2 wks' },
  { sl: 9, activity: 'Prefinal Exam', from: '10/11/25', to: '16/11/25', weeks: '1 wk' },
  { sl: 10, activity: 'Preparatory Leave', from: '17/11/25', to: '23/11/25', weeks: '1 wk' },
  { sl: 11, activity: 'University Exam', from: '24/11/25', to: '30/11/25', weeks: '1 wk' },
];

const bscSem6Calendar = [
  { sl: 1, activity: 'Orientation Program', from: '02/06/25', to: '07/06/25', weeks: '1 wk' },
  { sl: 2, activity: 'Theory Block', from: '09/06/25', to: '28/06/25', weeks: '3 wks' },
  { sl: 3, activity: 'Clinical Posting', from: '30/06/25', to: '05/07/25', weeks: '1 wk' },
  { sl: 4, activity: 'Summer Vacation', from: '07/07/25', to: '26/07/25', weeks: '3 wks' },
  { sl: 5, activity: 'First Term / Clinical Posting', from: '28/07/25', to: '02/08/25', weeks: '1 wk' },
  { sl: 6, activity: 'Clinical Posting / Skill Lab', from: '04/08/25', to: '30/08/25', weeks: '4 wks' },
  { sl: 7, activity: 'Theory Block', from: '01/09/25', to: '13/09/25', weeks: '2 wks' },
  { sl: 8, activity: 'Clinical Posting / Mid Term', from: '15/09/25', to: '20/09/25', weeks: '1 wk' },
  { sl: 9, activity: 'Clinical Posting', from: '22/09/25', to: '18/10/25', weeks: '4 wks' },
  { sl: 10, activity: 'Clinical Posting / Skill Lab', from: '20/10/25', to: '25/10/25', weeks: '1 wk' },
  { sl: 11, activity: 'College Week', from: '27/10/25', to: '01/11/25', weeks: '1 wk' },
  { sl: 12, activity: 'Theory Block', from: '03/11/25', to: '08/11/25', weeks: '1 wk' },
  { sl: 13, activity: 'Pre-final Exam', from: '10/11/25', to: '15/11/25', weeks: '1 wk' },
  { sl: 14, activity: 'Preparatory Leave', from: '17/11/25', to: '22/11/25', weeks: '1 wk' },
  { sl: 15, activity: 'University Exam', from: '24/11/25', to: '29/11/25', weeks: '1 wk' },
];

const bscYear4Calendar = [
  { sl: 1, activity: 'Orientation Program', from: '19/05/25', to: '25/05/25', weeks: '1 wk' },
  { sl: 2, activity: 'Theory Block', from: '26/05/25', to: '08/06/25', weeks: '2 wks' },
  { sl: 3, activity: 'Theory Block / Unit Test I', from: '09/06/25', to: '15/06/25', weeks: '1 wk' },
  { sl: 4, activity: 'Theory Block', from: '16/06/25', to: '29/06/25', weeks: '2 wks' },
  { sl: 5, activity: 'Summer Vacation', from: '30/06/25', to: '27/07/25', weeks: '4 wks' },
  { sl: 6, activity: 'Theory Block', from: '28/07/25', to: '03/08/25', weeks: '1 wk' },
  { sl: 7, activity: 'Clinical Posting', from: '04/08/25', to: '31/08/25', weeks: '4 wks' },
  { sl: 8, activity: 'Clinical Posting / Unit Test II', from: '01/09/25', to: '07/09/25', weeks: '1 wk' },
  { sl: 9, activity: 'Internship', from: '08/09/25', to: '12/10/25', weeks: '5 wks' },
  { sl: 10, activity: 'Theory Block', from: '13/10/25', to: '26/10/25', weeks: '2 wks' },
  { sl: 11, activity: 'College Week', from: '27/10/25', to: '02/11/25', weeks: '1 wk' },
  { sl: 12, activity: 'Theory Block / Sessional Exam I', from: '03/11/25', to: '09/11/25', weeks: '1 wk' },
  { sl: 13, activity: 'Internship', from: '10/11/25', to: '25/01/26', weeks: '11 wks' },
  { sl: 14, activity: 'Theory Block / Unit Test III', from: '26/01/26', to: '01/02/26', weeks: '1 wk' },
  { sl: 15, activity: 'Internship', from: '02/02/26', to: '01/03/26', weeks: '5 wks' },
  { sl: 16, activity: 'Management Posting', from: '02/03/26', to: '08/03/26', weeks: '1 wk' },
  { sl: 17, activity: 'Theory Block / Sessional Exam II', from: '09/03/26', to: '15/03/26', weeks: '1 wk' },
  { sl: 18, activity: 'Clinical Posting', from: '16/03/26', to: '12/04/26', weeks: '4 wks' },
  { sl: 19, activity: 'Research Project', from: '13/04/26', to: '19/04/26', weeks: '1 wk' },
  { sl: 20, activity: 'Revision', from: '20/04/26', to: '26/04/26', weeks: '1 wk' },
  { sl: 21, activity: 'Model Exam', from: '27/04/26', to: '03/05/26', weeks: '1 wk' },
  { sl: 22, activity: 'Preparatory Leave', from: '04/05/26', to: '10/05/26', weeks: '1 wk' },
  { sl: 23, activity: 'University Exam', from: '11/05/26', to: '17/05/26', weeks: '1 wk' },
];

const bscSem1Notes = [
  { label: 'Total Theory Hours Planned', planned: '576 Hrs', prescribed: '400 Hrs' },
  { label: 'Total Clinical Hours Planned', planned: '180 Hrs', prescribed: '160 Hrs' },
  { label: 'Total Working Hours Planned', planned: '756 Hrs', prescribed: '560 Hrs' },
];

const bscSem2Notes = [
  { label: 'Total Theory Hours & Skill Lab Planned', planned: '440 Hrs', prescribed: '420 Hrs' },
  { label: 'Total Clinical Hours Planned', planned: '336 Hrs', prescribed: '320 Hrs' },
  { label: 'Total Working Hours Planned', planned: '776 Hrs', prescribed: '740 Hrs' },
];

const bscSem4Notes = [
  { label: 'Total Theory Hours Planned', planned: '466 Hrs', prescribed: '280 Hrs' },
  { label: 'Total Clinical Hours Planned', planned: '480 Hrs', prescribed: '480 Hrs' },
  { label: 'Total Working Hours Planned', planned: '946 Hrs', prescribed: '760 Hrs' },
];

const bscSem6Notes = [
  { label: 'Total Theory Hours Planned', planned: '280 Hrs', prescribed: '200 Hrs' },
  { label: 'Total Clinical Hours Planned', planned: '591 Hrs', prescribed: '560 Hrs' },
  { label: 'Total Working Hours Planned', planned: '921 Hrs', prescribed: '800 Hrs' },
];

const bscYear4Notes = [
  { label: 'Total Theory Hours Planned', planned: '303 Hrs', prescribed: '225 Hrs' },
  { label: 'Total Clinical Hours Planned', planned: '410 Hrs', prescribed: '315 Hrs' },
  { label: 'Internship Hours', planned: '1168 Hrs', prescribed: '1150 Hrs' },
  { label: 'Total Working Hours Planned', planned: '1881 Hrs', prescribed: '1690 Hrs' },
];

const seedCalendar = async () => {
  try {
    console.log('⏳ Seeding Academic Calendar...');
    
    // Clear old records
    await pool.query('DELETE FROM academic_calendar');
    await pool.query('DELETE FROM academic_calendar_notes');

    // 1. Seed M.Sc Nursing (I & II Year combined, or I Year / II Year)
    let idx = 1;
    for (const item of mscNursingCalendar) {
      const id = `CAL-MSC-${idx++}`;
      // Determine if I year or II year
      const semester = item.activity.toLowerCase().includes('ii year') ? 'II Year' : 'I Year';
      await pool.query(
        'INSERT INTO academic_calendar (id, program, semester, sl, activity, dateFrom, dateTo, weeks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, 'msc', semester, item.sl, item.activity, item.from, item.to, '']
      );
    }

    // 2. Seed B.Sc Nursing Semesters
    const bscData = [
      { semester: 'I Sem', calendar: bscSem1Calendar, notes: bscSem1Notes },
      { semester: 'II Sem', calendar: bscSem2Calendar, notes: bscSem2Notes },
      { semester: 'IV Sem', calendar: bscSem4Calendar, notes: bscSem4Notes },
      { semester: 'VI Sem', calendar: bscSem6Calendar, notes: bscSem6Notes },
      { semester: 'IV Year', calendar: bscYear4Calendar, notes: bscYear4Notes },
    ];

    let bscIdx = 1;
    for (const group of bscData) {
      let itemIdx = 1;
      for (const item of group.calendar) {
        const id = `CAL-BSC-${bscIdx++}`;
        await pool.query(
          'INSERT INTO academic_calendar (id, program, semester, sl, activity, dateFrom, dateTo, weeks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, 'bsc', group.semester, item.sl, item.activity, item.from, item.to, item.weeks || '']
        );
      }

      let noteIdx = 1;
      for (const note of group.notes) {
        const noteId = `NOT-BSC-${bscIdx++}`;
        await pool.query(
          'INSERT INTO academic_calendar_notes (id, program, semester, label, planned, prescribed) VALUES (?, ?, ?, ?, ?, ?)',
          [noteId, 'bsc', group.semester, note.label, note.planned, note.prescribed]
        );
      }
    }

    console.log('✅ Academic Calendar seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Calendar Seeding Failed:', error);
    process.exit(1);
  }
};

seedCalendar();
