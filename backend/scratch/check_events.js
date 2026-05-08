const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT });

// Simulate exactly what the addEvent function sends
async function run() {
  try {
    // Check what event categories exist
    const cats = await pool.query("SELECT id, name FROM categories WHERE type = 'event'");
    console.log('Event categories:', JSON.stringify(cats.rows, null, 2));

    // Check what the events table looks like
    const events = await pool.query("SELECT id, title, event_date, category_id FROM events LIMIT 5");
    console.log('Events:', JSON.stringify(events.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}
run();
