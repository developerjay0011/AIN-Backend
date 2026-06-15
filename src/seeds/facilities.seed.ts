import pool from '../config/db.js';
import {
    initialCampusFacilities,
    initialHostelDetails,
    initialSnaDetails,
    initialStudentSupports
} from './data/facilities.js';

export const seedFacilities = async () => {
    // 1. Seed Campus Facilities
    console.log('🏫 Seeding campus facilities...');
    for (const f of initialCampusFacilities) {
        await pool.query(
            `INSERT INTO campus_facilities (id, title, description, image, features)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                title = VALUES(title), 
                description = VALUES(description), 
                image = VALUES(image), 
                features = VALUES(features)`,
            [f.id, f.title, f.description, f.image || null, f.features ? JSON.stringify(f.features) : null]
        );
    }
    console.log(`✅ Seeded ${initialCampusFacilities.length} campus facilities.`);

    // 2. Seed Hostel Details
    console.log('🏠 Seeding hostel details...');
    for (const h of initialHostelDetails) {
        await pool.query(
            `INSERT INTO hostel_details (id, title, description, amenities, wardenName, wardenPhone, ruleBookPdf)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                title = VALUES(title), 
                description = VALUES(description), 
                amenities = VALUES(amenities), 
                wardenName = VALUES(wardenName), 
                wardenPhone = VALUES(wardenPhone), 
                ruleBookPdf = VALUES(ruleBookPdf)`,
            [
                h.id,
                h.title,
                h.description,
                h.amenities ? JSON.stringify(h.amenities) : null,
                h.wardenName || null,
                h.wardenPhone || null,
                h.ruleBookPdf || null
            ]
        );
    }
    console.log(`✅ Seeded ${initialHostelDetails.length} hostel details entries.`);

    // 3. Seed SNA Details
    console.log('🎗️ Seeding SNA details...');
    for (const s of initialSnaDetails) {
        await pool.query(
            `INSERT INTO sna_details (id, objectives, executiveCommittee, functionalCommittees, annualEvents)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                objectives = VALUES(objectives), 
                executiveCommittee = VALUES(executiveCommittee), 
                functionalCommittees = VALUES(functionalCommittees), 
                annualEvents = VALUES(annualEvents)`,
            [
                s.id,
                s.objectives ? JSON.stringify(s.objectives) : null,
                s.executiveCommittee ? JSON.stringify(s.executiveCommittee) : null,
                s.functionalCommittees ? JSON.stringify(s.functionalCommittees) : null,
                s.annualEvents ? JSON.stringify(s.annualEvents) : null
            ]
        );
    }
    console.log(`✅ Seeded ${initialSnaDetails.length} SNA details entries.`);

    // 4. Seed Student Supports
    console.log('🤝 Seeding student supports...');
    for (const s of initialStudentSupports) {
        await pool.query(
            `INSERT INTO student_supports (id, name, description, icon, color, iconBg, iconColor)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                name = VALUES(name), 
                description = VALUES(description), 
                icon = VALUES(icon), 
                color = VALUES(color), 
                iconBg = VALUES(iconBg), 
                iconColor = VALUES(iconColor)`,
            [
                s.id,
                s.name,
                s.description,
                s.icon || null,
                s.color || null,
                s.iconBg || null,
                s.iconColor || null
            ]
        );
    }
    console.log(`✅ Seeded ${initialStudentSupports.length} student support entries.`);
};
