import pool from '../config/db.js';

async function testAutoColumn() {
  console.log('🧪 Testing Auto-Column Creation on Query Execution...');
  try {
    // Attempt to insert into publications with a non-existent column 'test_dummy_col'
    const [result] = await pool.query(
      `INSERT INTO publications (type, title, test_dummy_col) VALUES (?, ?, ?)`,
      ['journal', 'Test Auto Column', 'Auto Created Data']
    );
    console.log('✅ Query succeeded! Result:', result);

    // Clean up test insert and column
    const insertId = (result as any).insertId;
    await pool.query(`DELETE FROM publications WHERE id = ?`, [insertId]);
    await pool.query(`ALTER TABLE publications DROP COLUMN test_dummy_col`);
    console.log('🧹 Cleaned up test data and test column.');
  } catch (err: any) {
    console.error('❌ Test Failed:', err.message);
  } finally {
    process.exit(0);
  }
}

testAutoColumn();
