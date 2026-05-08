/**
 * Create live_streams and video_archive tables
 */
const { Client } = require('pg');
require('dotenv').config();

const migrate = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'st_patricks_db'
  });

  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS live_streams (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        stream_url TEXT NOT NULL,
        scheduled_time TIMESTAMP,
        thumbnail TEXT,
        is_live BOOLEAN DEFAULT false,
        total_views INT DEFAULT 0,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ live_streams table ready');

    await client.query(`
      CREATE TABLE IF NOT EXISTS video_archive (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url TEXT NOT NULL,
        category VARCHAR(50),
        duration VARCHAR(20),
        thumbnail TEXT,
        is_published BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        views INT DEFAULT 0,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ video_archive table ready');

    await client.end();
    console.log('🎉 Video tables migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    try { await client.end(); } catch(_) {}
    process.exit(1);
  }
};

migrate();
