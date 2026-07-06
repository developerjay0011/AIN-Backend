import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const conn = await mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'ain_db',
  timezone: '+05:30',
});

const [rows] = await conn.query(`
  SELECT 
    NOW()                AS mysql_now,
    @@global.time_zone   AS global_tz,
    @@session.time_zone  AS session_tz
`);

console.log('\n📅 MySQL Timezone Check\n');
console.table(rows);

const now = new Date();
console.log(`\n🖥️  Node.js time (local):  ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
console.log(`🌐  Node.js time (UTC):    ${now.toUTCString()}\n`);

await conn.end();
