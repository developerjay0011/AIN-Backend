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

// Wrap pool.query to auto-heal missing column errors (1054 / ER_BAD_FIELD_ERROR)
const originalQuery = pool.query.bind(pool);

(pool as any).query = async (sql: any, values?: any): Promise<any> => {
  try {
    return await originalQuery(sql, values);
  } catch (err: any) {
    const sqlStr = typeof sql === 'string' ? sql : (sql && sql.sql ? sql.sql : '');
    
    if (
      (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054 || (err.message && err.message.includes('Unknown column'))) &&
      sqlStr
    ) {
      const colMatch = err.message.match(/Unknown column '([^']+)'/i);
      const tableMatch = sqlStr.match(/(?:INSERT\s+INTO|UPDATE|FROM)\s+`?"?([a-zA-Z0-9_]+)`?"?/i);

      if (colMatch && colMatch[1] && tableMatch && tableMatch[1]) {
        const missingColumn = colMatch[1];
        const tableName = tableMatch[1];

        // Sanity check column and table names to prevent SQL injection
        if (/^[a-zA-Z0-9_]+$/.test(missingColumn) && /^[a-zA-Z0-9_]+$/.test(tableName)) {
          console.warn(`⚠️ Missing column '${missingColumn}' in table '${tableName}'. Auto-creating column...`);
          try {
            await originalQuery(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${missingColumn}\` TEXT DEFAULT NULL`);
            console.log(`✅ Auto-created missing column '${missingColumn}' in table '${tableName}'. Retrying query...`);
            return await originalQuery(sql, values);
          } catch (alterErr: any) {
            console.error(`❌ Auto-migration failed for column '${missingColumn}':`, alterErr.message);
          }
        }
      }
    }
    throw err;
  }
};

// Verify connection on startup
pool.getConnection()
  .then(conn => {
    console.log(`✅ MySQL connected → ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'ain_db'}`);
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('⚠️  Server will continue running, but DB-dependent features will fail.');
  });

export default pool;
