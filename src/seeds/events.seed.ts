import pool from '../config/db.js';

export const seedEvents = async () => {
    const events = [
        ['EVT-1775882000001', 'Main Institutional Building', 'The administrative heart of the Army Institute of Nursing Guwahati.', '2024-03-24', '10:00', '12:00', 'AIN Campus', 'Academic', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]', '/uploads/images/gallery/event_e1_m1.jpg'],
        ['EVT-1775882000002', 'Student Assembly & Academic Life', 'Cultivating the future of nursing through interactive learning environments.', '2024-03-22', '10:00', '12:00', 'AIN Campus', 'Cultural', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]', '/uploads/images/gallery/event_e2_m2.jpg'],
        ['EVT-1775882000003', 'Institutional Creative Arts Class', 'Promoting a holistic development through extracurricular artistic expression.', '2024-03-18', '10:00', '12:00', 'AIN Campus', 'Sports', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]', '/uploads/images/gallery/event_e3_m3.jpg'],
        ['EVT-1775882000004', 'Premier Music Performance Room', 'Our state-of-the-art music facility for student cultural events.', '2024-03-15', '10:00', '12:00', 'AIN Campus', 'Innovations', '["Interactive sessions and showcases", "Student-led displays and performances", "Guidance from industry experts/faculty", "Networking and community building"]', '/uploads/images/gallery/event_e4_m4.jpg']
    ];

    const albums = [
        ['ALB-001', 'Campus Infrastructure & Facilities', 'Explore the buildings, classrooms, library and overall setup of AIN Guwahati.', '/uploads/images/gallery/event_e1_m1.jpg'],
        ['ALB-002', 'Student Life & Assemblies', 'Glimpses of dynamic academic environments and classroom interaction sessions.', '/uploads/images/gallery/event_e2_m2.jpg'],
        ['ALB-003', 'Sports & Extracurricular Activities', 'Highlights from annual sports meets, outdoor arenas and creative arts programs.', '/uploads/images/gallery/event_e3_m3.jpg'],
        ['ALB-004', 'Nursing Labs & Innovations', 'State of the art chemistry, simulation and IT resource centers.', '/uploads/images/gallery/event_e4_m4.jpg']
    ];

    const media = [
        // Album ALB-001: Campus Infrastructure & Facilities
        ['MED-1775883000001', 'ALB-001', 'photo', '/uploads/images/gallery/event_e1_m1.jpg', 'Aerial View'],
        ['MED-1775883000002', 'ALB-001', 'photo', '/uploads/images/gallery/classroom.jpg', 'Modern Classrooms'],
        ['MED-1775883000003', 'ALB-001', 'photo', '/uploads/images/gallery/library.jpg', 'Central Library'],
        ['MED-1775883000004', 'ALB-001', 'photo', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'Academic Block'],
        ['MED-1775883000005', 'ALB-001', 'photo', 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800', 'Exam Hall'],

        // Album ALB-002: Student Life & Assemblies
        ['MED-1775883000006', 'ALB-002', 'photo', '/uploads/images/gallery/event_e2_m2.jpg', 'Student Assembly'],
        ['MED-1775883000007', 'ALB-002', 'photo', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 'Nursing Students'],
        ['MED-1775883000008', 'ALB-002', 'photo', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', 'Art Workshop'],
        ['MED-1775883000009', 'ALB-002', 'photo', '/uploads/images/gallery/cafeteria.jpg', 'Student Cafeteria'],

        // Album ALB-003: Sports & Extracurricular Activities
        ['MED-1775883000010', 'ALB-003', 'photo', '/uploads/images/gallery/event_e3_m3.jpg', 'Annual Sports Meet'],
        ['MED-1775883000011', 'ALB-003', 'photo', '/uploads/images/gallery/playground.jpg', 'Outdoor Arena'],

        // Album ALB-004: Nursing Labs & Innovations
        ['MED-1775883000012', 'ALB-004', 'photo', '/uploads/images/gallery/event_e4_m4.jpg', 'Digital Learning Center'],
        ['MED-1775883000013', 'ALB-004', 'photo', '/uploads/images/gallery/science-lab.jpg', 'Chemistry Lab'],
        ['MED-1775883000014', 'ALB-004', 'photo', '/uploads/images/gallery/robotics.jpg', 'Robotics Simulation'],
        ['MED-1775883000015', 'ALB-004', 'photo', '/uploads/images/gallery/computer-lab.jpg', 'IT Resource Hub'],
        ['MED-1775883000016', 'ALB-004', 'photo', 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800', 'Multimedia Studio'],
        ['MED-1775883000018', 'ALB-004', 'video', '/uploads/videos/gallery/1774524275426-535637036.mp4', 'Infrastructure Showcase']
    ];

    console.log('🖼️ Seeding Events & Gallery Albums...');
    
    // Clear existing tables
    await pool.query('DELETE FROM gallery_media');
    await pool.query('DELETE FROM gallery_albums');
    await pool.query('DELETE FROM events');

    // Seed Events
    for (const [id, name, desc, date, start, end, loc, tag, high, cover] of events) {
        await pool.query(
            'INSERT INTO events (id, name, description, date, startTime, endTime, location, mainTag, highlights, coverImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, desc, date, start, end, loc, tag, high, cover]
        );
    }

    // Seed Gallery Albums
    for (const [id, name, desc, cover] of albums) {
        await pool.query(
            'INSERT INTO gallery_albums (id, name, description, coverImage) VALUES (?, ?, ?, ?)',
            [id, name, desc, cover]
        );
    }

    // Seed Media
    for (const [id, albumId, type, url, name] of media) {
        await pool.query(
            'INSERT INTO gallery_media (id, albumId, type, url, name) VALUES (?, ?, ?, ?, ?)',
            [id, albumId, type, url, name]
        );
    }

    console.log(`✅ Seeded ${events.length} events, ${albums.length} albums, and ${media.length} media items.`);
};
