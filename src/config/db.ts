import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ain_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30', // IST — Indian Standard Time
});

// Verify connection on startup
pool.getConnection()
  .then(conn => {
    console.log(`✅ MySQL connected → ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'ain_db'}`);
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('⚠️  Server will continue running, but DB-dependent features will fail.');
    // Removed process.exit(1) to prevent server crash
  });

export default pool;
