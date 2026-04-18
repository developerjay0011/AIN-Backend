import pool from '../config/db.js';

export const seedNotices = async () => {
    const notices = [
        ['NOT-1775884100001', 'Celebration of Graduation Ceremony (Batch 2020) & Annual Day (2025-26) on 19 Mar 2026', 'Official notice regarding the upcoming graduation ceremony and annual day celebration for the Batch 2020.', '2026-03-19', 'NEW', 1, null],
        ['NOT-1775884100002', 'Extension of last date of bid submission for procurement of interactive panel, furniture and lab articles & Manikins', 'Institutional notice regarding the extension of bidding timelines for equipment procurement.', null, 'NOTICE', 0, null],
        ['NOT-1775884100003', 'Publication of College Magazine "AAROHAN" 2024-25', 'The official college magazine "AAROHAN" for the academic year 2024-25 is now available.', null, 'NEW', 0, null],
        ['NOT-1775884100004', 'Holi Celebration @ AIN Hostel on 03 & 04 Feb 2026', 'Official announcement for Holi celebrations scheduled at the AIN Hostel premises.', null, 'EVENT', 0, null],
        ['NOT-1775884100005', 'Director and Offg Principal receiving a gift hamper from Hon’ble Governor of Assam', 'A proud moment for AIN Guwahati as the leadership receives recognition from the Governor.', null, 'UPDATE', 0, null],
        ['NOT-1775884100006', 'TENDER ADVT FOR PROCUREMENT OF FURNITURE, INTERACTIVE SMART PANEL, FIXTURES, CIVIL WORKS', 'Detailed tender notice for various institutional furniture and infrastructure projects.', null, 'NOTICE', 0, null],
        ['NOT-1775884100007', 'Circular to obtain Pass Certificate (Batch 2020)', 'Official circular for students of the 2020 batch to collect their pass certificates.', null, 'NOTICE', 0, null],
        ['NOT-1775884100008', 'Detail Advertisement for Assistant Warden', 'Recruitment notice for the position of Assistant Warden at AIN Guwahati.', null, 'CAREER', 0, null],
        ['NOT-1775884100009', 'Auction Sale Notice of unserviceable items', 'Notice regarding the auction of items declared unserviceable by ASTB-24-25.', null, 'NOTICE', 0, null],
        ['NOT-1775884100010', 'Hostel Order regarding timings and discipline', 'Official standing order regarding hostel discipline and entry/exit timings.', null, 'UPDATE', 0, null],
        ['NOT-1775884100011', 'Tender document for students mess in AIN Hostel', 'Official bidding documents for the management of the student mess facilities.', null, 'NOTICE', 0, null],
        ['NOT-1775884100012', 'Call for Quotation for shifting of CCTV and Wi-Fi', 'Bids invited for the relocation and maintenance of campus security and networking gear.', null, 'NOTICE', 0, null],
        ['NOT-1775884100013', 'Pre bid meeting and Bid Submission end date details', 'Scheduling details for pre-bid consultations and final submission deadlines.', null, 'NOTICE', 0, null],
        ['NOT-1775884100014', 'Corrigendum for procurement of furniture NIT No.: AIN/HOSTEL/NUR/GHY/02', 'Administrative correction to the previous furniture procurement notification.', null, 'UPDATE', 0, null],
        ['NOT-1775884100015', 'QUOTATION FOR PROCUREMENT OF A 40+01 SEATER BUS', 'Request for quotations for the purchase of a new institutional transport vehicle.', null, 'NOTICE', 0, null],
        ['NOT-1775884100016', 'Detail Advertisement for the post of Prof cum Principal', 'Recruitment notice and application form for the position of Professor cum Principal.', null, 'CAREER', 0, null],
        ['NOT-1775884100018', 'Tender notice for Furniture procurement', 'Specific bidding details for academic and residential furniture.', null, 'NOTICE', 0, null],
        ['NOT-1775884100019', 'Detail Advertisement for Academic Staff', 'Recruitment drive and application form for various teaching and academic support positions.', null, 'CAREER', 0, null],
        ['NOT-1775884100021', 'Detail Advertisement for LDC (Accounts)', 'Job opening and application form for Lower Division Clerk (Accounts).', null, 'CAREER', 0, null],
        ['NOT-1775884100023', 'Tender For Construction of new facilities', 'Bids invited for the construction and expansion of campus infrastructure.', null, 'NOTICE', 0, null],
        ['NOT-1775884100024', 'Quotation for Stationary supply for 2024-25', 'Request for quotations for the annual supply of office and academic stationary.', null, 'NOTICE', 0, null]
    ];

    const links = [
        ['LNK-1775884200001', 'NOT-1775884100001', 'Attachment', '/uploads/documents/notices/grad1.jpg'],
        ['LNK-1775884200002', 'NOT-1775884100002', 'Attachment', '/uploads/documents/notices/advt.pdf'],
        ['LNK-1775884200003', 'NOT-1775884100003', 'Attachment', '/uploads/documents/notices/Arohan2425.pdf'],
        ['LNK-1775884200004', 'NOT-1775884100004', 'Attachment', 'https://ainguwahati.org/1.pdf'],
        ['LNK-1775884200005', 'NOT-1775884100005', 'Attachment', '/uploads/documents/notices/achvmnt.pdf'],
        ['LNK-1775884200006', 'NOT-1775884100006', 'Attachment', '/uploads/documents/notices/multiple_.jpeg'],
        ['LNK-1775884200007', 'NOT-1775884100007', 'Attachment', '/uploads/documents/notices/PassCerti.pdf'],
        ['LNK-1775884200008', 'NOT-1775884100008', 'Attachment', '/uploads/documents/notices/asstwrdn.pdf'],
        ['LNK-1775884200009', 'NOT-1775884100009', 'Attachment', '/uploads/documents/notices/auction.pdf'],
        ['LNK-1775884200010', 'NOT-1775884100010', 'Attachment', '/uploads/documents/notices/Hostelorder.pdf'],
        ['LNK-1775884200011', 'NOT-1775884100011', 'Attachment', '/uploads/documents/notices/Mess.pdf'],
        ['LNK-1775884200012', 'NOT-1775884100012', 'Attachment', '/uploads/documents/notices/CCTV&WiFi.pdf'],
        ['LNK-1775884200013', 'NOT-1775884100013', 'Attachment', '/uploads/documents/notices/final.pdf'],
        ['LNK-1775884200014', 'NOT-1775884100014', 'Attachment', '/uploads/documents/notices/Corrigendum.pdf'],
        ['LNK-1775884200015', 'NOT-1775884100015', 'Attachment', '/uploads/documents/notices/bus.pdf'],
        ['LNK-1775884200016', 'NOT-1775884100016', 'Attachment', '/uploads/documents/notices/ADVT.pdf'],
        ['LNK-1775884200017', 'NOT-1775884100016', 'Form', '/uploads/documents/notices/FORM.pdf'],
        ['LNK-1775884200018', 'NOT-1775884100018', 'Attachment', '/uploads/documents/notices/Tenderfurniture.jpeg'],
        ['LNK-1775884200019', 'NOT-1775884100019', 'Attachment', '/uploads/documents/notices/adacademic.pdf'],
        ['LNK-1775884200020', 'NOT-1775884100019', 'Form', '/uploads/documents/notices/academicapplication.pdf'],
        ['LNK-1775884200021', 'NOT-1775884100021', 'Attachment', '/uploads/documents/notices/adforadm.pdf'],
        ['LNK-1775884200022', 'NOT-1775884100021', 'Form', '/uploads/documents/notices/admapplication.pdf'],
        ['LNK-1775884200023', 'NOT-1775884100023', 'Attachment', '/uploads/documents/notices/Tender1.pdf'],
        ['LNK-1775884200024', 'NOT-1775884100024', 'Attachment', '/uploads/documents/notices/QuotationforStationery.pdf']
    ];

    console.log('📢 Seeding Notices...');
    for (const [id, title, desc, date, type, crit, img] of notices) {
        await pool.query(
            'REPLACE INTO notices (id, title, description, date, type, critical, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, title, desc, date, type, crit, img]
        );
    }

    for (const [id, noticeId, label, url] of links) {
        await pool.query(
            'REPLACE INTO notice_links (id, noticeId, label, url) VALUES (?, ?, ?, ?)',
            [id, noticeId, label, url]
        );
    }
    console.log(`✅ Seeded ${notices.length} notices and ${links.length} attachments.`);
};
