const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'santana',
  database: 'st_patricks_db',
  port: 5432,
  ssl: false
});

async function check() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'priest_messages'");
    console.log('Columns:', res.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();

check();
