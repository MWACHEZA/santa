const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const pool = new Pool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT });

// Fix non-UUID category IDs
const badIds = ['event-cat-001', 'event-cat-002', 'event-cat-003'];

async function run() {
  try {
    for (const badId of badIds) {
      const newId = uuidv4();
      // Update category ID
      const res = await pool.query("UPDATE categories SET id = $1 WHERE id = $2 RETURNING name", [newId, badId]);
      if (res.rowCount > 0) {
        // Update any events referencing old ID
        await pool.query("UPDATE events SET category_id = $1 WHERE category_id = $2", [newId, badId]);
        console.log(`Fixed category: ${res.rows[0].name} -> ${newId}`);
      } else {
        console.log(`Category ${badId} not found, skipping`);
      }
    }
    // Verify
    const cats = await pool.query("SELECT id, name FROM categories WHERE type = 'event'");
    console.log('Final event categories:', JSON.stringify(cats.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
}
run();
