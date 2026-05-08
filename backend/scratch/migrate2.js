/**
 * MIGRATION 2 — Create prayer_intentions table + fix missing columns
 */
const { Client } = require('pg');
require('dotenv').config();

const migrate2 = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'st_patricks_db'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create prayer_intentions table from scratch
    console.log('\n📌 Creating prayer_intentions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS prayer_intentions (
        id VARCHAR(36) PRIMARY KEY,
        intention TEXT NOT NULL,
        requester_name VARCHAR(100),
        requester_email VARCHAR(100),
        is_anonymous BOOLEAN DEFAULT false,
        is_urgent BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        approved_by VARCHAR(36) REFERENCES users(id),
        approved_at TIMESTAMP NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ prayer_intentions table ready');

    // Verify all tables exist now
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log('\n📋 Current tables:', tables.rows.map(r => r.table_name));

    console.log('\n🎉 Migration 2 complete!');
    await client.end();
  } catch (err) {
    console.error('\n❌ Migration 2 failed:', err.message);
    try { await client.end(); } catch(_) {}
    process.exit(1);
  }
};

migrate2();
