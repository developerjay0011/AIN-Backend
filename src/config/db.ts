import mysql from 'mysql2/promise';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_TYPE = process.env.DB_TYPE || 'sqlite';
const dbPath = path.resolve(__dirname, '../../ain_local.db');

let pool: any;

if (DB_TYPE === 'mysql') {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ain_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  // SQLite Local Mode (using built-in Node 22.5+ node:sqlite)
  console.log(`📦 Using Local SQLite Database (Experimental): ${dbPath}`);
  const db = new DatabaseSync(dbPath);
  
  // Compatibility wrapper to mimic mysql2/promise .query()
  pool = {
    query: async (sql: string, params: any[] = []) => {
      // Map booleans to 1/0 and undefined to null for SQLite compatibility
      const safeParams = params.map(p => {
        if (typeof p === 'boolean') return p ? 1 : 0;
        if (p === undefined) return null;
        return p;
      });
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = (db as any).prepare(sql);
        const rows = stmt.all(...safeParams);
        return [rows, null];
      } else {
        const stmt = (db as any).prepare(sql);
        const info = stmt.run(...safeParams);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }, null];
      }
    },
    execute: async (sql: string, params: any[] = []) => {
      // Map booleans to 1/0 and undefined to null for SQLite compatibility
      const safeParams = params.map(p => {
        if (typeof p === 'boolean') return p ? 1 : 0;
        if (p === undefined) return null;
        return p;
      });
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = (db as any).prepare(sql);
        const rows = stmt.all(...safeParams);
        return [rows, null];
      } else {
        const stmt = (db as any).prepare(sql);
        const info = stmt.run(...safeParams);
        return [{ insertId: info.lastInsertRowid, affectedRows: info.changes }, null];
      }
    }
  };
}

export default pool;
