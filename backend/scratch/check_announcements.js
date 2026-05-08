const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'santana',
  database: 'st_patricks_db',
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'announcements'
    `);
    console.log('Columns in announcements:');
    res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
