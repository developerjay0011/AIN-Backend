import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(process.cwd(), 'ain_local.db');
const db = new DatabaseSync(dbPath);

const uploadDir = path.resolve(process.cwd(), 'uploads/images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const initialEvents = [
    {
        id: 'e1',
        name: 'Main Institutional Building',
        description: 'The administrative heart of the Army Institute of Nursing Guwahati.',
        date: '2024-03-24',
        mainTag: 'Campus',
        media: [
            { id: 'm1', type: 'photo', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800' }
        ]
    },
    {
        id: 'e2',
        name: 'Student Assembly & Academic Life',
        description: 'Cultivating the future of nursing through interactive learning environments.',
        date: '2024-03-22',
        mainTag: 'Life',
        media: [
            { id: 'm2', type: 'photo', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800' }
        ]
    },
    {
        id: 'e3',
        name: 'Institutional Creative Arts Class',
        description: 'Promoting a holistic development through extracurricular artistic expression.',
        date: '2024-03-18',
        mainTag: 'Activities',
        media: [
            { id: 'm3', type: 'photo', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800' }
        ]
    },
    {
        id: 'e4',
        name: 'Premier Music Performance Room',
        description: 'Our state-of-the-art music facility for student cultural events.',
        date: '2024-03-15',
        mainTag: 'Activities',
        media: [
            { id: 'm4', type: 'photo', url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800' }
        ]
    },
    {
        id: 'e5',
        name: 'Institutional Examination Hall',
        description: 'A dedicated space for professional academic evaluations and testing.',
        date: '2024-03-12',
        mainTag: 'Campus',
        media: [
            { id: 'm5', type: 'photo', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800' }
        ]
    }
];

async function downloadImage(url: string, filename: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const stream = Readable.fromWeb(response.body as any);
        const writer = fs.createWriteStream(path.join(uploadDir, filename));
        stream.pipe(writer);
        await finished(writer);
        return `/uploads/images/${filename}`;
    } catch (error) {
        console.error(`Failed to download image from ${url}:`, error);
        return null;
    }
}

async function seed() {
    console.log('🌱 Seeding Events...');

    // Clear existing data from gallery_events and gallery_media
    db.exec(`
        DELETE FROM gallery_media;
        DELETE FROM gallery_events;
    `);

    const insertEvent = db.prepare(`
        INSERT INTO gallery_events (id, name, description, date, startTime, endTime, location, mainTag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMedia = db.prepare(`
        INSERT INTO gallery_media (id, eventId, type, url, name)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const event of initialEvents) {
        insertEvent.run(
            event.id,
            event.name,
            event.description,
            event.date,
            '10:00', // Default dummy startTime
            '12:00', // Default dummy endTime
            'AIN Campus', // Default dummy location
            event.mainTag
        );
        
        for (const mediaItem of event.media) {
            const filename = `event_${event.id}_${mediaItem.id}.jpg`;
            const localImagePath = await downloadImage(mediaItem.url, filename);
            insertMedia.run(
                mediaItem.id,
                event.id,
                mediaItem.type,
                localImagePath || mediaItem.url,
                null
            );
        }
        
        console.log(`✅ Seeded Event: ${event.name}`);
    }

    console.log('🏁 Event Seeding Complete!');
    db.close();
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
