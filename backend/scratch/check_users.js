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
    const res = await pool.query("SELECT title, image_url FROM gallery");
    console.log('Gallery Data:', JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
check();

check();
