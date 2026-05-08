const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'st_patricks_db'
});

async function addSectionColumn() {
  try {
    await client.connect();
    console.log('Adding section column to users table...');
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(100)");
    console.log('Successfully added section column');
  } catch (err) {
    console.error('Error adding section column:', err.message);
  } finally {
    await client.end();
  }
}

addSectionColumn();
