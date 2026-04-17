import pool from '../config/db.js';

export const seedEvents = async () => {
    const events = [
        ['EVT-1775882000001', 'Main Institutional Building', 'The administrative heart of the Army Institute of Nursing Guwahati.', '2024-03-24', '10:00', '12:00', 'AIN Campus', 'Academic', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]'],
        ['EVT-1775882000002', 'Student Assembly & Academic Life', 'Cultivating the future of nursing through interactive learning environments.', '2024-03-22', '10:00', '12:00', 'AIN Campus', 'Cultural', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]'],
        ['EVT-1775882000003', 'Institutional Creative Arts Class', 'Promoting a holistic development through extracurricular artistic expression.', '2024-03-18', '10:00', '12:00', 'AIN Campus', 'Sports', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]'],
        ['EVT-1775882000004', 'Premier Music Performance Room', 'Our state-of-the-art music facility for student cultural events.', '2024-03-15', '10:00', '12:00', 'AIN Campus', 'Innovations', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]']
    ];

    const media = [
        // Event EVT-1775882000001: Academic & Campus Facilities
        ['MED-1775883000001', 'EVT-1775882000001', 'photo', '/uploads/images/event_e1_m1.jpg', 'Aerial View'],
        ['MED-1775883000002', 'EVT-1775882000001', 'photo', '/uploads/images/classroom.jpg', 'Modern Classrooms'],
        ['MED-1775883000003', 'EVT-1775882000001', 'photo', '/uploads/images/library.jpg', 'Central Library'],
        ['MED-1775883000004', 'EVT-1775882000001', 'photo', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'Academic Block'],
        ['MED-1775883000005', 'EVT-1775882000001', 'photo', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800', 'Exam Hall'],

        // Event EVT-1775882000002: Student Life & Cultural
        ['MED-1775883000006', 'EVT-1775882000002', 'photo', '/uploads/images/event_e2_m2.jpg', 'Student Assembly'],
        ['MED-1775883000007', 'EVT-1775882000002', 'photo', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 'Nursing Students'],
        ['MED-1775883000008', 'EVT-1775882000002', 'photo', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 'Art Workshop'],
        ['MED-1775883000009', 'EVT-1775882000002', 'photo', '/uploads/images/cafeteria.jpg', 'Student Cafeteria'],

        // Event EVT-1775882000003: Sports & Recreation
        ['MED-1775883000010', 'EVT-1775882000003', 'photo', '/uploads/images/event_e3_m3.jpg', 'Annual Sports Meet'],
        ['MED-1775883000011', 'EVT-1775882000003', 'photo', '/uploads/images/playground.jpg', 'Outdoor Arena'],

        // Event EVT-1775882000004: Innovations, Labs & Technology
        ['MED-1775883000012', 'EVT-1775882000004', 'photo', '/uploads/images/event_e4_m4.jpg', 'Digital Learning Center'],
        ['MED-1775883000013', 'EVT-1775882000004', 'photo', '/uploads/images/science-lab.jpg', 'Chemistry Lab'],
        ['MED-1775883000014', 'EVT-1775882000004', 'photo', '/uploads/images/robotics.jpg', 'Robotics Simulation'],
        ['MED-1775883000015', 'EVT-1775882000004', 'photo', '/uploads/images/computer-lab.jpg', 'IT Resource Hub'],
        ['MED-1775883000016', 'EVT-1775882000004', 'photo', 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800', 'Multimedia Studio'],
        ['MED-1775883000018', 'EVT-1775882000004', 'video', '/uploads/videos/1774524275426-535637036.mp4', 'Infrastructure Showcase']
    ];

    console.log('🖼️ Seeding Events & Gallery...');
    for (const [id, name, desc, date, start, end, loc, tag, high] of events) {
        await pool.query(
            'REPLACE INTO gallery_events (id, name, description, date, startTime, endTime, location, mainTag, highlights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, desc, date, start, end, loc, tag, high]
        );
    }

    for (const [id, eventId, type, url, name] of media) {
        await pool.query(
            'REPLACE INTO gallery_media (id, eventId, type, url, name) VALUES (?, ?, ?, ?, ?)',
            [id, eventId, type, url, name]
        );
    }
    console.log(`✅ Seeded ${events.length} events and ${media.length} media items.`);
};
