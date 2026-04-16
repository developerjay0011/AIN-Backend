import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../ain_local.db');

async function removeNf() {
    console.log(`Connecting to database at ${dbPath}`);
    if (!fs.existsSync(dbPath)) {
        console.log('Database file does not exist yet. No cleanup needed.');
        return;
    }
    
    try {
        const db = new DatabaseSync(dbPath);
        const stmt = (db as any).prepare("DELETE FROM departments WHERE departmentId = 'nf'");
        const info = stmt.run();
        console.log(`Removed ${info.changes} records for 'nf' department.`);
    } catch (e) {
        console.error('Failed to cleanup nf department:', e);
    }
}

removeNf();
