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

const teachingStaff = [
    { id: '1', name: 'Prof. Kabita Baishya', role: 'Officiating Principal', qualification: 'M.Sc Nursing, Ph.D', experience: '25+ Years', specialization: 'Medical Surgical Nursing', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop' },
    { id: '2', name: 'Lt Col (Mrs.) P. Singh', role: 'Vice Principal', qualification: 'M.Sc Nursing', experience: '20+ Years', specialization: 'Community Health Nursing', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop' },
    { id: '3', name: 'Mrs. Anjali Sharma', role: 'Associate Professor', qualification: 'M.Sc Nursing', experience: '15 Years', specialization: 'OBG Nursing', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' },
    { id: '4', name: 'Ms. Priyanka Das', role: 'Assistant Professor', qualification: 'M.Sc Nursing', experience: '10 Years', specialization: 'Pediatric Nursing', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop' },
    { id: '5', name: 'Mrs. Ritu Baruah', role: 'Tutor', qualification: 'B.Sc Nursing', experience: '5 Years', specialization: 'Clinical Nursing', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop' },
    { id: '6', name: 'Ms. Sunita Gogoi', role: 'Tutor', qualification: 'B.Sc Nursing', experience: '4 Years', specialization: 'Mental Health Nursing', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
    { id: '7', name: 'Mrs. Karabi Das', role: 'Tutor', qualification: 'M.Sc Nursing', experience: '6 Years', specialization: 'Psychiatric Nursing', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
    { id: '8', name: 'Ms. Jumi Kalita', role: 'Clinical Instructor', qualification: 'B.Sc Nursing', experience: '3 Years', specialization: 'Community Nursing', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop' },
];

const nonTeachingStaff = [
    { id: '101', name: 'Maj Gen (Dr.) R. K. Sharma', role: 'Director', department: 'Administration', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop' },
    { id: '102', name: 'Mr. Rajesh Kumar', role: 'Office Superintendent', department: 'Accounts & Admin', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop' },
    { id: '103', name: 'Mrs. Meena Kalita', role: 'Librarian', department: 'Library', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop' },
    { id: '104', name: 'Mr. Bikash Saikia', role: 'IT Coordinator', department: 'IT Support', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { id: '105', name: 'Mrs. Deepa Rajbongshi', role: 'Warden', department: 'Hostel Management', image: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=400&h=400&fit=crop' },
    { id: '106', name: 'Mr. Sunil Thapa', role: 'Estate supervisor', department: 'Facilities', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
    { id: '107', name: 'Mr. Amit Baruah', role: 'Lab Assistant', department: 'Nursing Labs', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop' },
    { id: '108', name: 'Ms. Sangita Rabha', role: 'Clerk', department: 'Academic Section', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop' },
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
    console.log('🌱 Seeding Staff & Faculty...');

    const insertStaff = db.prepare(`
        INSERT INTO staff (id, name, role, type, image, qualification, experience, specialization, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Seed Teaching Staff
    for (const member of teachingStaff) {
        const filename = `staff_${member.id}.jpg`;
        const localImagePath = await downloadImage(member.image, filename);
        insertStaff.run(
            member.id,
            member.name,
            member.role,
            'teaching',
            localImagePath || member.image,
            member.qualification,
            member.experience,
            member.specialization,
            null
        );
        console.log(`✅ Seeded Teaching: ${member.name}`);
    }

    // Seed Non-Teaching Staff
    for (const member of nonTeachingStaff) {
        const filename = `staff_${member.id}.jpg`;
        const localImagePath = await downloadImage(member.image, filename);
        insertStaff.run(
            member.id,
            member.name,
            member.role,
            'non-teaching',
            localImagePath || member.image,
            null,
            null,
            null,
            member.department
        );
        console.log(`✅ Seeded Non-Teaching: ${member.name}`);
    }

    console.log('🏁 Seeding Complete!');
    db.close();
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
