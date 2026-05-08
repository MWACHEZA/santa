/**
 * MIGRATION SCRIPT — Fix all DB schema issues
 * 
 * Problems fixed:
 * 1. category_type enum missing 'prayer' and 'financial'
 * 2. Missing 'ministries' table (route expects: id, name, description, leader_name, leader_contact, meeting_schedule, requirements, is_active, created_by)
 * 3. Missing 'sacraments' table (route expects: id, name, description, requirements, preparation_time, contact_person, contact_info, is_active, created_by)
 * 4. Missing 'news' table (route expects: id, title, summary, content, category_id, image_url, author, author_role, is_published, is_archived, published_at, archived_at, created_by)
 * 5. Missing 'prayers' table
 * 6. 'events' table missing columns: event_date, start_time, end_time, image_url, max_attendees, current_attendees, created_by, updated_at (route uses these)
 *    existing table has: id, title, description, date, time, location, category, is_published, created_at
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
    console.log('✅ Connected to database');

    // ── 1. Add 'prayer' and 'financial' to category_type enum ────────────────
    console.log('\n📌 Step 1: Updating category_type enum...');
    
    // Check current enum values
    const enumValues = await client.query(`
      SELECT enumlabel FROM pg_enum e 
      JOIN pg_type t ON e.enumtypid = t.oid 
      WHERE t.typname = 'category_type'
    `);
    const existing = enumValues.rows.map(r => r.enumlabel);
    console.log('   Current values:', existing);

    if (!existing.includes('prayer')) {
      await client.query(`ALTER TYPE category_type ADD VALUE 'prayer'`);
      console.log('   ✅ Added prayer');
    } else {
      console.log('   ⏭️  prayer already exists');
    }

    if (!existing.includes('financial')) {
      await client.query(`ALTER TYPE category_type ADD VALUE 'financial'`);
      console.log('   ✅ Added financial');
    } else {
      console.log('   ⏭️  financial already exists');
    }

    // ── 2. Fix events table — add missing columns ─────────────────────────────
    console.log('\n📌 Step 2: Fixing events table columns...');

    const eventsColsRes = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'events'
    `);
    const eventsCols = eventsColsRes.rows.map(r => r.column_name);

    // Add event_date (alias for date column if needed)
    if (!eventsCols.includes('event_date') && eventsCols.includes('date')) {
      await client.query(`ALTER TABLE events RENAME COLUMN "date" TO event_date`);
      console.log('   ✅ Renamed date → event_date');
    } else if (!eventsCols.includes('event_date')) {
      await client.query(`ALTER TABLE events ADD COLUMN event_date DATE`);
      console.log('   ✅ Added event_date column');
    }

    if (!eventsCols.includes('start_time')) {
      // Rename existing 'time' column if present
      if (eventsCols.includes('time')) {
        await client.query(`ALTER TABLE events RENAME COLUMN "time" TO start_time`);
        console.log('   ✅ Renamed time → start_time');
      } else {
        await client.query(`ALTER TABLE events ADD COLUMN start_time VARCHAR(20)`);
        console.log('   ✅ Added start_time column');
      }
    }

    if (!eventsCols.includes('end_time')) {
      await client.query(`ALTER TABLE events ADD COLUMN end_time VARCHAR(20)`);
      console.log('   ✅ Added end_time column');
    }

    if (!eventsCols.includes('image_url')) {
      await client.query(`ALTER TABLE events ADD COLUMN image_url TEXT`);
      console.log('   ✅ Added image_url column');
    }

    if (!eventsCols.includes('max_attendees')) {
      await client.query(`ALTER TABLE events ADD COLUMN max_attendees INT`);
      console.log('   ✅ Added max_attendees column');
    }

    if (!eventsCols.includes('current_attendees')) {
      await client.query(`ALTER TABLE events ADD COLUMN current_attendees INT DEFAULT 0`);
      console.log('   ✅ Added current_attendees column');
    }

    if (!eventsCols.includes('created_by')) {
      await client.query(`ALTER TABLE events ADD COLUMN created_by VARCHAR(36) REFERENCES users(id)`);
      console.log('   ✅ Added created_by column');
    }

    if (!eventsCols.includes('updated_at')) {
      await client.query(`ALTER TABLE events ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('   ✅ Added updated_at column');
    }

    // Add category_id column for FK-based category lookup (routes JOIN on this)
    if (!eventsCols.includes('category_id')) {
      await client.query(`ALTER TABLE events ADD COLUMN category_id VARCHAR(36) REFERENCES categories(id)`);
      console.log('   ✅ Added category_id FK column');
    }

    // ── 3. Create ministries table ────────────────────────────────────────────
    console.log('\n📌 Step 3: Creating ministries table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ministries (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        leader_name VARCHAR(100),
        leader_contact VARCHAR(200),
        contact_person VARCHAR(100),
        contact_info TEXT,
        meeting_schedule VARCHAR(200),
        meeting_time VARCHAR(200),
        requirements TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ ministries table ready');

    // ── 4. Create sacraments table ────────────────────────────────────────────
    console.log('\n📌 Step 4: Creating sacraments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sacraments (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        requirements TEXT,
        preparation_time VARCHAR(100),
        contact_person VARCHAR(100),
        contact_info TEXT,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ sacraments table ready');

    // ── 5. Create news table ──────────────────────────────────────────────────
    console.log('\n📌 Step 5: Creating news table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        summary TEXT,
        content TEXT NOT NULL,
        category_id VARCHAR(36) REFERENCES categories(id),
        image_url TEXT,
        author VARCHAR(100),
        author_role VARCHAR(100),
        is_published BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        archived_at TIMESTAMP NULL,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ news table ready');

    // ── 6. Create prayers table ───────────────────────────────────────────────
    console.log('\n📌 Step 6: Creating prayers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS prayers (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        text TEXT NOT NULL,
        category VARCHAR(100),
        language VARCHAR(50) DEFAULT 'English',
        image_url TEXT,
        is_published BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ prayers table ready');

    // ── 7. Insert default categories ─────────────────────────────────────────
    console.log('\n📌 Step 7: Inserting default categories...');
    
    // We need to commit the enum changes first before using them
    // Use a small delay to ensure enum values are committed
    const categoriesToInsert = [
      ['news-cat-001', 'General News', 'news'],
      ['news-cat-002', 'Parish News', 'news'],
      ['news-cat-003', 'Announcements', 'news'],
      ['event-cat-001', 'Mass & Liturgy', 'event'],
      ['event-cat-002', 'Parish Events', 'event'],
      ['event-cat-003', 'Community', 'event'],
      ['min-cat-001', 'Youth Ministries', 'ministry'],
      ['min-cat-002', "Women's Associations", 'ministry'],
      ['min-cat-003', "Men's Guild", 'ministry'],
      ['sac-cat-001', 'Initiation', 'sacrament'],
      ['sac-cat-002', 'Healing', 'sacrament'],
    ];

    for (const [id, name, type] of categoriesToInsert) {
      try {
        await client.query(
          `INSERT INTO categories (id, name, type) VALUES ($1, $2, $3::category_type) ON CONFLICT DO NOTHING`,
          [id, name, type]
        );
      } catch (e) {
        console.log(`   ⚠️  Skipping ${name} (${type}): ${e.message}`);
      }
    }
    console.log('   ✅ Default categories inserted');

    await client.end();
    console.log('\n🎉 Migration complete! All issues fixed.');

  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    try { await client.end(); } catch(_) {}
    process.exit(1);
  }
};

migrate();
