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

const toppers = [
    { name: 'S Esthar Rani', rankTag: 'University Rank', rank: '#1', img: 'https://ainguwahati.org/1st.jpeg' },
    { name: 'Payal Goswami', rankTag: 'University Rank', rank: '#6', img: 'https://ainguwahati.org/6.jpeg' },
    { name: 'Raksha Bishwas', rankTag: 'University Rank', rank: '#9', img: 'https://ainguwahati.org/9.jpeg' },
    { name: 'Kajol Jena', rankTag: 'University Rank', rank: '#11', img: 'https://ainguwahati.org/11.jpeg' },
    { name: 'Tanushree Samanta', rankTag: 'University Rank', rank: '#20', img: 'https://ainguwahati.org/20.jpeg' },
];

async function downloadImage(url: string, filename: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const responseBody = response.body;
        if (!responseBody) throw new Error('Response body is null');

        const stream = Readable.fromWeb(responseBody as any);
        const writer = fs.createWriteStream(path.join(uploadDir, filename));
        stream.pipe(writer);
        await finished(writer);
        return `uploads/images/${filename}`;
    } catch (error) {
        console.error(`Failed to download image from ${url}:`, error);
        return url; // Fallback to remote URL
    }
}

async function seed() {
    console.log('🌱 Seeding Hall of Fame (Toppers)...');

    // Clear existing toppers
    db.prepare('DELETE FROM toppers').run();

    const insertTopper = (db as any).prepare(`
        INSERT INTO toppers (id, name, rankTag, rank, imageUrl)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < toppers.length; i++) {
        const item = toppers[i];
        const id = (Date.now() + i).toString();
        const ext = item.img.split('.').pop() || 'jpg';
        const filename = `topper_${i + 1}.${ext}`;
        
        const localPath = await downloadImage(item.img, filename);
        
        insertTopper.run(
            id,
            item.name,
            item.rankTag,
            item.rank,
            localPath
        );
        console.log(`✅ Seeded: ${item.name} (${item.rankTag} ${item.rank})`);
    }

    console.log('🏁 Seeding Complete!');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
