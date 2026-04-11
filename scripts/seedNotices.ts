import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(process.cwd(), 'ain_local.db');
const db = new DatabaseSync(dbPath);

const notices = [
    { id: 1, title: 'Celebration of Graduation Ceremony (Batch 2020) & Annual Day (2025-26) on 19 Mar 2026', date: 'March 19, 2026', type: 'NEW', critical: true, description: 'Official notice regarding the upcoming graduation ceremony and annual day celebration for the Batch 2020.', links: [{ label: 'Download Document', url: 'https://ainguwahati.org/grad1.jpg' }] },
    { id: 2, title: 'Extension of last date of bid submission for procurement of interactive panel, furniture and lab articles & Manikins', type: 'NOTICE', description: 'Institutional notice regarding the extension of bidding timelines for equipment procurement.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/advt.pdf' }] },
    { id: 3, title: 'Publication of College Magazine "AAROHAN" 2024-25', type: 'NEW', description: 'The official college magazine "AAROHAN" for the academic year 2024-25 is now available.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/Arohan2425.pdf' }] },
    { id: 4, title: 'Holi Celebration @ AIN Hostel on 03 & 04 Feb 2026', type: 'EVENT', description: 'Official announcement for Holi celebrations scheduled at the AIN Hostel premises.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/1.pdf' }] },
    { id: 5, title: 'Director and Offg Principal receiving a gift hamper from Hon’ble Governor of Assam', type: 'UPDATE', description: 'A proud moment for AIN Guwahati as the leadership receives recognition from the Governor.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/achvmnt.pdf' }] },
    { id: 6, title: 'TENDER ADVT FOR PROCUREMENT OF FURNITURE, INTERACTIVE SMART PANEL, FIXTURES, CIVIL WORKS', type: 'NOTICE', description: 'Detailed tender notice for various institutional furniture and infrastructure projects.', links: [{ label: 'Download Document', url: 'https://ainguwahati.org/multiple%20.jpeg' }] },
    { id: 7, title: 'Circular to obtain Pass Certificate (Batch 2020)', type: 'NOTICE', description: 'Official circular for students of the 2020 batch to collect their pass certificates.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/PassCerti.pdf' }] },
    { id: 8, title: 'Detail Advertisement for Assistant Warden', type: 'CAREER', description: 'Recruitment notice for the position of Assistant Warden at AIN Guwahati.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/asstwrdn.pdf' }] },
    { id: 9, title: 'Auction Sale Notice of unserviceable items', type: 'NOTICE', description: 'Notice regarding the auction of items declared unserviceable by ASTB-24-25.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/auction.pdf' }] },
    { id: 10, title: 'Hostel Order regarding timings and discipline', type: 'UPDATE', description: 'Official standing order regarding hostel discipline and entry/exit timings.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/Hostelorder.pdf' }] },
    { id: 11, title: 'Tender document for students mess in AIN Hostel', type: 'NOTICE', description: 'Official bidding documents for the management of the student mess facilities.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/Mess.pdf' }] },
    { id: 12, title: 'Call for Quotation for shifting of CCTV and Wi-Fi', type: 'NOTICE', description: 'Bids invited for the relocation and maintenance of campus security and networking gear.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/CCTV&WiFi.pdf' }] },
    { id: 13, title: 'Pre bid meeting and Bid Submission end date details', type: 'NOTICE', description: 'Scheduling details for pre-bid consultations and final submission deadlines.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/final.pdf' }] },
    { id: 14, title: 'Corrigendum for procurement of furniture NIT No.: AIN/HOSTEL/NUR/GHY/02', type: 'UPDATE', description: 'Administrative correction to the previous furniture procurement notification.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/Corrigendum.pdf' }] },
    { id: 15, title: 'QUOTATION FOR PROCUREMENT OF A 40+01 SEATER BUS', type: 'NOTICE', description: 'Request for quotations for the purchase of a new institutional transport vehicle.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/bus.pdf' }] },
    { id: 16, title: 'Detail Advertisement for the post of Prof cum Principal', type: 'CAREER', description: 'Recruitment notice and application form for the position of Professor cum Principal.', links: [{ label: 'Notice', url: 'https://ainguwahati.org/ADVT.pdf' }, { label: 'Application Form', url: 'https://ainguwahati.org/FORM.pdf' }] },
    { id: 18, title: 'Tender notice for Furniture procurement', type: 'NOTICE', description: 'Specific bidding details for academic and residential furniture.', links: [{ label: 'Download Document', url: 'https://ainguwahati.org/Tenderfurniture.jpeg' }] },
    { id: 19, title: 'Detail Advertisement for Academic Staff', type: 'CAREER', description: 'Recruitment drive and application form for various teaching and academic support positions.', links: [{ label: 'Notice', url: 'https://ainguwahati.org/adacademic.pdf' }, { label: 'Application Form', url: 'https://ainguwahati.org/academicapplication.pdf' }] },
    { id: 21, title: 'Detail Advertisement for LDC (Accounts)', type: 'CAREER', description: 'Job opening and application form for Lower Division Clerk (Accounts).', links: [{ label: 'Notice', url: 'https://ainguwahati.org/adforadm.pdf' }, { label: 'Application Form', url: 'https://ainguwahati.org/admapplication.pdf' }] },
    { id: 23, title: 'Tender For Construction of new facilities', type: 'NOTICE', description: 'Bids invited for the construction and expansion of campus infrastructure.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/Tender1.pdf' }] },
    { id: 24, title: 'Quotation for Stationary supply for 2024-25', type: 'NOTICE', description: 'Request for quotations for the annual supply of office and academic stationary.', links: [{ label: 'Download PDF', url: 'https://ainguwahati.org/QuotationforStationery.pdf' }] }
];

async function seed() {
    console.log('🌱 Seeding Notices...');

    // Clear existing notices
    db.exec(`
        DELETE FROM notice_links;
        DELETE FROM notices;
    `);

    const insertNotice = db.prepare(`
        INSERT INTO notices (id, title, description, date, type, critical, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLink = db.prepare(`
        INSERT INTO notice_links (noticeId, label, url)
        VALUES (?, ?, ?)
    `);

    for (const notice of notices) {
        insertNotice.run(
            notice.id.toString(),
            notice.title,
            notice.description || '',
            notice.date || new Date().toISOString().split('T')[0],
            notice.type || 'NOTICE',
            notice.critical ? 1 : 0,
            null // image_url
        );

        if (notice.links) {
            for (const link of notice.links) {
                insertLink.run(
                    notice.id.toString(),
                    link.label,
                    link.url
                );
            }
        }

        console.log(`✅ Seeded Notice: ${notice.title}`);
    }

    console.log('🏁 Notice Seeding Complete!');
    db.close();
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
