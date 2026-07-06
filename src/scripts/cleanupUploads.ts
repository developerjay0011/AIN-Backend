import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to this script in src/scripts/
const PROJECT_ROOT = path.join(__dirname, '../../');
const SEEDS_DIR = path.join(PROJECT_ROOT, 'src/seeds');
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'uploads');

/**
 * Recursively find all TypeScript files in the seeds directory
 */
const getAllSeedFiles = (dir: string): string[] => {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return [];
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllSeedFiles(fullPath));
        } else if (file.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
};

/**
 * Build a whitelist of all files referenced in seed scripts
 */
const getEssentialFiles = () => {
    const seedFiles = getAllSeedFiles(SEEDS_DIR);
    const whitelist = new Set<string>();

    seedFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Find strings that contain "uploads/" anywhere inside them
        const matches = content.match(/['"][^'"]*uploads\/[^'"]+['"]/g);
        if (matches) {
            matches.forEach(match => {
                let cleanPath = match.replace(/['"]/g, '');
                
                // If it's a full URL, extract only the part starting from uploads/
                const uploadsIdx = cleanPath.indexOf('uploads/');
                if (uploadsIdx !== -1) {
                    cleanPath = cleanPath.substring(uploadsIdx);
                }
                
                // Add to whitelist
                whitelist.add(path.normalize(cleanPath));
            });
        }
    });

    return whitelist;
};

/**
 * Main cleanup logic
 */
const cleanup = () => {
    console.log('🧹 Starting smart cleanup of uploads folder...');
    
    if (!fs.existsSync(UPLOADS_DIR)) {
        console.log('⚠️ Uploads directory not found. Skipping.');
        return;
    }

    const whitelist = getEssentialFiles();
    console.log(`📜 Found ${whitelist.size} essential files in seeds.`);

    let deletedCount = 0;
    let keptCount = 0;

    const walkAndCleanup = (dir: string) => {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const relativePath = path.relative(PROJECT_ROOT, fullPath);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walkAndCleanup(fullPath);
                // Optionally remove empty directories if needed, 
                // but usually better to keep the structure.
            } else {
                if (!whitelist.has(path.normalize(relativePath))) {
                    console.log(`🗑️  Deleting orphaned file: ${relativePath}`);
                    fs.unlinkSync(fullPath);
                    deletedCount++;
                } else {
                    keptCount++;
                }
            }
        });
    };

    walkAndCleanup(UPLOADS_DIR);

    console.log('-----------------------------------');
    console.log(`✅ Cleanup complete!`);
    console.log(`📦 Files Kept: ${keptCount}`);
    console.log(`🗑️  Files Removed: ${deletedCount}`);
    console.log('-----------------------------------');
};

try {
    cleanup();
} catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
}
