import pool from '../config/db.js';

export const seedInquiries = async () => {
    const admissionInquiries = [
        ['ADM-1001', 'Arjun Singh', 'Vikram Singh', 'arjun.singh@example.com', '9876543210', 'B.Sc Nursing', 'I am interested in the 2024 academic session. What is the last date for admission?', 'Pending'],
        ['ADM-1002', 'Priya Das', 'Sanjay Das', 'priya.das@example.com', '8765432109', 'Post Basic B.Sc', 'I am a registered nurse and would like to upgrade my qualification. Please share the fee structure.', 'Contacted'],
        ['ADM-1003', 'Sneha Baruah', 'Nitul Baruah', 'sneha.b@example.com', '7654321098', 'M.Sc Nursing', 'Does the institute provide hostel facilities for M.Sc students?', 'Resolved'],
        ['ADM-1004', 'Rahul Kalita', 'Prabin Kalita', 'rahul.k@example.com', '6543210987', 'B.Sc Nursing', 'Seeking information about the entrance exam syllabus.', 'Pending']
    ];

    const contactInquiries = [
        ['CON-2001', 'John Doe', 'john.doe@email.com', '9988776655', 'Alumni Verification', 'I need my degree verification for higher studies abroad.', 'New'],
        ['CON-2002', 'Mahesh Sharma', 'mahesh.s@email.com', '8877665544', 'Partnership Inquiry', 'We are looking to collaborate with AIN for a research project.', 'In Progress'],
        ['CON-2003', 'Dr. S. Roy', 's.roy@hospital.com', '7766554433', 'Job Placement', 'We have vacancies for staff nurses. How can we conduct campus interviews?', 'Completed']
    ];

    console.log('📝 Seeding Inquiries...');
    
    // Seed Admission Inquiries
    for (const [id, student, parent, email, phone, grade, msg, status] of admissionInquiries) {
        await pool.query(
            'REPLACE INTO admission_inquiries (id, studentName, parentName, email, phone, grade, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, student, parent, email, phone, grade, msg, status]
        );
    }

    // Seed Contact Inquiries
    for (const [id, name, email, phone, subject, msg, status] of contactInquiries) {
        await pool.query(
            'REPLACE INTO contact_inquiries (id, fullName, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, email, phone, subject, msg, status]
        );
    }

    console.log(`✅ Seeded ${admissionInquiries.length} admission and ${contactInquiries.length} contact inquiries.`);
};
