const { Pool, Client } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'st_patricks_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Helper to convert '?' placeholders to '$1, $2, ...'
const convertPlaceholders = (sql) => {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
};

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  const client = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres' // Connect to default postgres db first
  });

  try {
    console.log('Initializing database...');
    await client.connect();

    // Create database if it doesn't exist
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbConfig.database}...`);
      await client.query(`CREATE DATABASE ${dbConfig.database}`);
    }
    await client.end();

    // Connect to the actual database
    const dbClient = new Client(dbConfig);
    await dbClient.connect();

    console.log('Creating tables and types...');

    // Helper for updated_at trigger
    await dbClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create ENUM types if they don't exist
    const createEnumType = async (typeName, values) => {
      const typeExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = '${typeName}'`);
      if (typeExists.rowCount === 0) {
        await dbClient.query(`CREATE TYPE ${typeName} AS ENUM (${values.map(v => `'${v}'`).join(', ')})`);
      }
    };

    const addColumnIfNotExists = async (tableName, columnName, columnDefinition) => {
      const res = await dbClient.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = '${tableName}' AND column_name = '${columnName}'
      `);
      if (res.rowCount === 0) {
        console.log(`Adding column ${columnName} to table ${tableName}...`);
        await dbClient.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
      }
    };

    await createEnumType('user_role', ['admin', 'priest', 'secretary', 'reporter', 'vice_secretary', 'parishioner', 'treasurer']);
    await createEnumType('category_type', ['news', 'event', 'ministry', 'sacrament', 'general', 'video', 'financial', 'gallery']);
    
    // Ensure existing enum is updated if it was created without the new types
    try {
      await dbClient.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'treasurer'");
      await dbClient.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'vice_secretary'");
      await dbClient.query("ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'video'");
      await dbClient.query("ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'financial'");
      await dbClient.query("ALTER TYPE category_type ADD VALUE IF NOT EXISTS 'gallery'");
    } catch (e) {
      // Ignore if not supported or already exists (though IF NOT EXISTS handles it)
      console.log('Note: ALTER TYPE might have been skipped or failed (expected in some environments)', e.message);
    }
    await createEnumType('announcement_type', ['general', 'urgent', 'event', 'mass']);
    await createEnumType('author_role', ['priest', 'secretary', 'reporter', 'vice_secretary']);
    await createEnumType('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
    await createEnumType('schedule_language', ['english', 'isindebele', 'both']);
    await createEnumType('schedule_type', ['mass', 'confession', 'adoration', 'rosary']);

    // Users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        date_of_birth DATE,
        address TEXT,
        emergency_contact VARCHAR(100),
        emergency_phone VARCHAR(20),
        role user_role DEFAULT 'parishioner',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        is_baptized BOOLEAN DEFAULT false,
        baptism_date DATE NULL,
        baptism_venue VARCHAR(255) NULL,
        is_confirmed BOOLEAN DEFAULT false,
        confirmation_date DATE NULL,
        confirmation_venue VARCHAR(255) NULL,
        receives_communion BOOLEAN DEFAULT false,
        first_communion_date DATE NULL,
        is_married BOOLEAN DEFAULT false,
        marriage_date DATE NULL,
        marriage_venue VARCHAR(255) NULL,
        spouse_name VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `);
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    // Dynamically migrate existing users table if columns are missing
    await addColumnIfNotExists('users', 'is_baptized', 'BOOLEAN DEFAULT false');
    await addColumnIfNotExists('users', 'baptism_date', 'DATE NULL');
    await addColumnIfNotExists('users', 'baptism_venue', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('users', 'is_confirmed', 'BOOLEAN DEFAULT false');
    await addColumnIfNotExists('users', 'confirmation_date', 'DATE NULL');
    await addColumnIfNotExists('users', 'confirmation_venue', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('users', 'receives_communion', 'BOOLEAN DEFAULT false');
    await addColumnIfNotExists('users', 'first_communion_date', 'DATE NULL');
    await addColumnIfNotExists('users', 'is_married', 'BOOLEAN DEFAULT false');
    await addColumnIfNotExists('users', 'marriage_date', 'DATE NULL');
    await addColumnIfNotExists('users', 'marriage_venue', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('users', 'spouse_name', 'VARCHAR(100) NULL');

    // Categories table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type category_type NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, type)
      )
    `);

    // Announcements table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        type announcement_type DEFAULT 'general',
        is_active BOOLEAN DEFAULT true,
        start_date DATE,
        end_date DATE,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await addColumnIfNotExists('announcements', 'content', 'TEXT');
    await addColumnIfNotExists('announcements', 'start_date', 'DATE');
    await addColumnIfNotExists('announcements', 'end_date', 'DATE');
    await addColumnIfNotExists('announcements', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('announcements', 'created_by', 'VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL');

    // Events table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
        image_url VARCHAR(500),
        is_published BOOLEAN DEFAULT false,
        max_attendees INT,
        current_attendees INT DEFAULT 0,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // News table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
        image_url VARCHAR(500),
        author VARCHAR(100) NOT NULL,
        author_role author_role NOT NULL,
        is_published BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        archived_at TIMESTAMP NULL,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gallery table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
        event_id VARCHAR(36) REFERENCES events(id) ON DELETE SET NULL,
        is_featured BOOLEAN DEFAULT false,
        upload_date DATE NOT NULL,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contact info table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        emergency_phone VARCHAR(20),
        office_hours_weekdays VARCHAR(100),
        office_hours_saturday VARCHAR(100),
        office_hours_sunday VARCHAR(100),
        updated_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await addColumnIfNotExists('contact_info', 'emergency_phone', 'VARCHAR(20)');
    await addColumnIfNotExists('priest_messages', 'image_url', 'TEXT');
    await addColumnIfNotExists('priest_messages', 'is_published', 'BOOLEAN DEFAULT false');
    await addColumnIfNotExists('contact_info', 'office_hours_weekdays', 'VARCHAR(100)');
    await addColumnIfNotExists('contact_info', 'office_hours_saturday', 'VARCHAR(100)');
    await addColumnIfNotExists('contact_info', 'office_hours_sunday', 'VARCHAR(100)');

    // Mass schedule table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS mass_schedule (
        id VARCHAR(36) PRIMARY KEY,
        day_of_week day_of_week NOT NULL,
        time TIME NOT NULL,
        language schedule_language DEFAULT 'english',
        type schedule_type DEFAULT 'mass',
        is_active BOOLEAN DEFAULT true,
        updated_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Prayer intentions table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS prayer_intentions (
        id VARCHAR(36) PRIMARY KEY,
        intention TEXT NOT NULL,
        requester_name VARCHAR(100),
        requester_email VARCHAR(100),
        is_anonymous BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        is_urgent BOOLEAN DEFAULT false,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP NULL
      )
    `);

    // Ministries table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS ministries (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        leader_name VARCHAR(100),
        leader_contact VARCHAR(100),
        meeting_schedule VARCHAR(255),
        requirements TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await addColumnIfNotExists('ministries', 'image_url', 'VARCHAR(500)');
    await addColumnIfNotExists('ministries', 'category', 'VARCHAR(100)');

    // Sacraments table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS sacraments (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        requirements TEXT,
        preparation_time VARCHAR(100),
        contact_person VARCHAR(100),
        contact_info VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Live streams table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS live_streams (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        stream_url VARCHAR(500) NOT NULL,
        is_live BOOLEAN DEFAULT false,
        scheduled_time TIMESTAMP,
        viewers INT DEFAULT 0,
        total_views INT DEFAULT 0,
        thumbnail VARCHAR(500),
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Video archive table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS video_archive (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500) NOT NULL,
        thumbnail VARCHAR(500),
        duration VARCHAR(20),
        category VARCHAR(50), -- Can be a name from categories table
        is_published BOOLEAN DEFAULT false,
        views INT DEFAULT 0,
        published_at TIMESTAMP NULL,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id VARCHAR(36) PRIMARY KEY,
        page_path VARCHAR(255) NOT NULL,
        visitor_ip VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        session_id VARCHAR(100),
        visit_date DATE NOT NULL,
        visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // File uploads table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id VARCHAR(36) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Audit logs table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(36),
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Theme of Year table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS themes_of_year (
        id VARCHAR(36) PRIMARY KEY,
        year INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        verse TEXT,
        description TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT false,
        created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await dbClient.query('CREATE INDEX IF NOT EXISTS idx_themes_year ON themes_of_year(year)');

    // Add updated_at triggers
    const tables = ['users', 'categories', 'announcements', 'events', 'news', 'gallery', 'contact_info', 'mass_schedule', 'ministries', 'sacraments', 'audit_logs', 'themes_of_year'];
    for (const table of tables) {
      await dbClient.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}`);
      await dbClient.query(`
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
      `);
    }

    console.log('✅ Database tables initialized successfully');
    await dbClient.end();

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    if (client) await client.end().catch(() => {});
    throw error;
  }
};

// Insert default data
const insertDefaultData = async () => {
  try {
    // Check if admin user exists
    const [adminUsers] = await module.exports.execute('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);

    if (adminUsers.length === 0) {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');

      // Create default admin user
      const adminId = uuidv4();
      const adminPassword = await bcrypt.hash('admin123', 12);

      await module.exports.execute(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active)
        VALUES ($1, 'admin', 'admin@stpatricks.com', $2, 'System', 'Administrator', 'admin', true)
      `, [adminId, adminPassword]);

      const parishionerId = uuidv4();
      const parishionerPassword = await bcrypt.hash('parish123', 12);

      await module.exports.execute(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active)
        VALUES ($1, 'parishioner', 'parishioner@stpatricks.com', $2, 'Test', 'Parishioner', 'parishioner', true)
      `, [parishionerId, parishionerPassword]);

      console.log('✅ Default users created');
    }

    const defaultCategories = [
      { name: 'Liturgy', type: 'news', description: 'Mass schedules, liturgical celebrations' },
      { name: 'Community', type: 'news', description: 'Community events and activities' },
      { name: 'Education', type: 'news', description: 'Religious education and classes' },
      { name: 'Youth', type: 'news', description: 'Youth ministry activities' },
      { name: 'Charity', type: 'news', description: 'Charitable works and donations' },
      { name: 'Events', type: 'event', description: 'Church events and gatherings' },
      { name: 'Announcements', type: 'general', description: 'General announcements' },
      { name: 'Choir', type: 'ministry', description: 'Church choir ministry' },
      { name: 'Baptism', type: 'sacrament', description: 'Baptism sacrament' },
      { name: 'Confirmation', type: 'sacrament', description: 'Confirmation sacrament' },
      { name: 'Marriage', type: 'sacrament', description: 'Marriage sacrament' }
    ];

    for (const category of defaultCategories) {
      const { v4: uuidv4 } = require('uuid');
      await module.exports.execute(`
        INSERT INTO categories (id, name, type, description, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (name, type) DO NOTHING
      `, [uuidv4(), category.name, category.type, category.description]);
    }

    // Insert default contact info
    const [contactExists] = await module.exports.execute('SELECT id FROM contact_info LIMIT 1');
    if (contactExists.length === 0) {
      const { v4: uuidv4 } = require('uuid');
      await module.exports.execute(`
        INSERT INTO contact_info (id, phone, email, address, emergency_phone, office_hours_weekdays, office_hours_saturday, office_hours_sunday)
        VALUES ($1, '+263 9 123456', 'info@stpatricks.com', 'Makokoba, Bulawayo, Zimbabwe', '+263 9 654321', '8:00 AM - 5:00 PM', '8:00 AM - 12:00 PM', 'After Mass')
      `, [uuidv4()]);
    }

    console.log('✅ Default data inserted successfully');

  } catch (error) {
    console.error('❌ Failed to insert default data:', error);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  insertDefaultData,
  execute: async (sql, params = []) => {
    // If we're using $1 style placeholders, don't convert them again
    const convertedSql = sql.includes('$1') ? sql : convertPlaceholders(sql);
    const res = await pool.query(convertedSql, params);
    return [res.rows, res.fields];
  },
  query: async (sql, params = []) => {
    const convertedSql = sql.includes('$1') ? sql : convertPlaceholders(sql);
    const res = await pool.query(convertedSql, params);
    return [res.rows, res.fields];
  }
};
