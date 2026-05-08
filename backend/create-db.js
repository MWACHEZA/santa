<<<<<<< HEAD
const { Client } = require('pg');
=======
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
require('dotenv').config();

const createDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: 'postgres'
  });

  try {
    console.log('🔍 Creating database...');
<<<<<<< HEAD
    await client.connect();

    const dbName = process.env.DB_NAME || 'st_patricks_db';
    
    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully`);
    } else {
      console.log(`ℹ️ Database ${dbName} already exists`);
    }
    await client.end();

    // Reconnect with database specified
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    });
    await dbClient.connect();

    // Create custom types if not exists
    const userRoleExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = 'user_role'`);
    if (userRoleExists.rowCount === 0) {
      await dbClient.query(`CREATE TYPE user_role AS ENUM ('admin', 'priest', 'secretary', 'reporter', 'vice_secretary', 'parishioner', 'treasurer', 'committee_member')`);
    }

    const transactionTypeExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = 'transaction_type'`);
    if (transactionTypeExists.rowCount === 0) {
      await dbClient.query(`CREATE TYPE transaction_type AS ENUM ('income', 'expense')`);
    }

    const entityTypeExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = 'entity_type'`);
    if (entityTypeExists.rowCount === 0) {
      await dbClient.query(`CREATE TYPE entity_type AS ENUM ('association', 'section', 'parish')`);
    }

    const currencyTypeExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = 'currency_type'`);
    if (currencyTypeExists.rowCount === 0) {
      await dbClient.query(`CREATE TYPE currency_type AS ENUM ('USD', 'ZAR', 'ZiG')`);
    }

    const paymentMethodExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = 'payment_method'`);
    if (paymentMethodExists.rowCount === 0) {
      await dbClient.query(`CREATE TYPE payment_method AS ENUM ('Cash', 'Ecocash', 'Bank')`);
    }

    const statusTypeExists = await dbClient.query(`SELECT 1 FROM pg_type WHERE typname = 'status_type'`);
    if (statusTypeExists.rowCount === 0) {
      await dbClient.query(`CREATE TYPE status_type AS ENUM ('pending', 'approved', 'rejected')`);
    }

    // Create announcements table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Announcements table created');

    // Create categories table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'financial', 'news', 'event', etc.
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, type)
      )
    `);
    console.log('✅ Categories table created');

    // Create sections table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Sections table created');

    // Create associations table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS associations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        section_id VARCHAR(36) REFERENCES sections(id),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Associations table created');

    // Create users table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        role user_role DEFAULT 'parishioner',
        association_id VARCHAR(36) REFERENCES associations(id),
        section_id VARCHAR(36) REFERENCES sections(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create priest_messages table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS priest_messages (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_published BOOLEAN DEFAULT true,
        author_id VARCHAR(36) REFERENCES users(id)
      )
    `);
    console.log('✅ Priest messages table created');

    // Create events table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time VARCHAR(20),
        location VARCHAR(100),
        category VARCHAR(50),
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Events table created');

    // Create financial_transactions table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS financial_transactions (
        id VARCHAR(36) PRIMARY KEY,
        entity_id VARCHAR(100) NOT NULL, -- associationId in frontend
        entity_name VARCHAR(100) NOT NULL, -- associationName in frontend
        entity_type entity_type NOT NULL,
        type transaction_type NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        currency currency_type NOT NULL,
        payment_method payment_method NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        owner_name VARCHAR(100),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        recorded_by VARCHAR(36) REFERENCES users(id),
        recorded_by_name VARCHAR(100),
        status status_type DEFAULT 'approved'
      )
    `);
    console.log('✅ Financial transactions table created');

    // Insert default admin
    await dbClient.query(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO NOTHING
    `, ['admin-uuid-1234', 'admin', 'admin@stpatricks.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.e', 'System', 'Administrator', 'admin']);

    // Create file_uploads table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id VARCHAR(36) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by VARCHAR(36) REFERENCES users(id),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ File uploads table created');

    // Create contact_info table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(50),
        email VARCHAR(100),
        address TEXT,
        emergency_phone VARCHAR(50),
        office_hours_weekdays VARCHAR(100),
        office_hours_saturday VARCHAR(100),
        office_hours_sunday VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Contact info table created');

    // Create mass_schedules table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS mass_schedules (
        id VARCHAR(36) PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        times TEXT[] NOT NULL,
        language VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Mass schedules table created');
    
    // Create sacraments table
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS sacraments (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        requirements TEXT, -- Will store as JSON stringified array
        preparation_time VARCHAR(100),
        contact_person VARCHAR(100),
        contact_info TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Sacraments table created');

    // Seed sacraments if empty
    const { rows: sacramentCount } = await dbClient.query('SELECT COUNT(*) FROM sacraments');
    if (parseInt(sacramentCount[0].count) === 0) {
      const sacraments = [
        ['Baptism', 'The first sacrament of Christian initiation, welcoming the person into the Church.', JSON.stringify(['Birth Certificate', 'Godparents Information', 'Parents Baptismal Certificates']), '2 weeks preparation', 'Parish Secretary', 'Contact office at least 1 month before desired date', 'https://images.unsplash.com/photo-1544928147-79723ec42ba1?auto=format&fit=crop&q=80&w=800'],
        ['Confirmation', 'A sacrament of initiation that completes the grace of Baptism through the sealing of the Holy Spirit.', JSON.stringify(['Baptismal Certificate', 'Sponsor Details', 'Completion of Catechism classes']), '1 year program', 'Youth Coordinator', 'Classes begin every September', 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&q=80&w=800'],
        ['Eucharist', 'Also known as Holy Communion, it is the center of the Church\'s life.', JSON.stringify(['Baptismal Certificate', 'First Reconciliation']), '6 months preparation', 'Catechism Team', 'Usually celebrated in Grade 3', 'https://images.unsplash.com/photo-1548625361-987823337920?auto=format&fit=crop&q=80&w=800'],
        ['Reconciliation', 'The sacrament through which we receive God\'s forgiveness for our sins.', JSON.stringify(['Baptism']), 'Continuous', 'Parish Priests', 'Confessions available every Saturday at 3 PM', 'https://images.unsplash.com/photo-1543165365-072ca2028043?auto=format&fit=crop&q=80&w=800'],
        ['Anointing of the Sick', 'A sacrament of healing for those who are seriously ill or elderly.', JSON.stringify(['None']), 'Immediate/On-call', 'Emergency Contact', 'Call the parish office or emergency line at any time', 'https://images.unsplash.com/photo-1445510491599-c391e8046a68?auto=format&fit=crop&q=80&w=800'],
        ['Marriage', 'The sacrament by which a man and a woman establish a lifelong partnership.', JSON.stringify(['Baptismal & Confirmation Certificates', 'Marriage Preparation Course', 'Civil Documents']), '6 months preparation', 'Marriage Ministry', 'Contact the office at least 6 months in advance', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800'],
        ['Holy Orders', 'The sacrament through which the mission entrusted by Christ to his apostles continues.', JSON.stringify(['Baptismal Certificate', 'Confirmation Certificate', 'Discernment Interview']), 'Years of formation', 'Vocations Director', 'Contact the Bishop\'s office for discernment', 'https://images.unsplash.com/photo-1543165365-072ca2028043?auto=format&fit=crop&q=80&w=800']
      ];

      for (const s of sacraments) {
        await dbClient.query(
          'INSERT INTO sacraments (id, name, description, requirements, preparation_time, contact_person, contact_info, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [require('uuid').v4(), ...s]
        );
      }
      console.log('✅ Sacraments seeded');
    }

    await dbClient.end();
    console.log('🎉 Database setup complete!');

=======
    const dbName = process.env.DB_NAME || 'st_patricks_db';
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4',
      multipleStatements: true
    });

    const schemaPath = path.resolve(__dirname, 'comprehensive-database-schema.sql');
    let schemaSql = await fs.readFile(schemaPath, 'utf8');
    schemaSql = schemaSql.replace(/st_patricks_db/g, dbName);
    schemaSql = schemaSql.replace(/INSERT INTO prayers \(id, title, content, category, language, is_public, created_by\)/g, 'INSERT INTO prayers (id, title, content, prayer_type, language, is_active, created_by)');
    schemaSql = schemaSql
      .replace(/first_name VARCHAR\(50\) NOT NULL/g, 'first_name VARCHAR(50)')
      .replace(/last_name VARCHAR\(50\) NOT NULL/g, 'last_name VARCHAR(50)')
      .replace(/gender ENUM\('male', 'female'\) NOT NULL/g, "gender ENUM('male', 'female')")
      .replace(/INSERT INTO system_settings/g, 'INSERT IGNORE INTO system_settings');
    schemaSql = `SET FOREIGN_KEY_CHECKS=0;\n${schemaSql}\nSET FOREIGN_KEY_CHECKS=1;`;

    await connection.query(schemaSql);
    console.log('✅ Database and tables created successfully');

    await connection.end();
    console.log('🎉 Database setup complete!');
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (client) await client.end().catch(() => {});
    process.exit(1);
  }
};

createDatabase();
