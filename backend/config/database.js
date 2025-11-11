const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'st_patricks_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection function
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection established');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // First, connect without specifying database to create it
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      charset: 'utf8mb4'
    });
    
    // Create database if it doesn't exist
    console.log('Creating database if not exists...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.execute(`USE ${dbConfig.database}`);
    console.log('Database created/connected successfully');
    
    // Users table
    await connection.execute(`
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
        role ENUM('admin', 'priest', 'secretary', 'reporter', 'vice_secretary', 'parishioner') DEFAULT 'parishioner',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      )
    `);
    
    // Categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('news', 'event', 'ministry', 'sacrament', 'general') NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_category_type (name, type),
        INDEX idx_type (type)
      )
    `);
    
    // Announcements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('general', 'urgent', 'event', 'mass') DEFAULT 'general',
        is_active BOOLEAN DEFAULT true,
        start_date DATE,
        end_date DATE,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_type (type),
        INDEX idx_active (is_active),
        INDEX idx_dates (start_date, end_date)
      )
    `);
    
    // Events table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        location VARCHAR(255),
        category_id VARCHAR(36),
        image_url VARCHAR(500),
        is_published BOOLEAN DEFAULT false,
        max_attendees INT,
        current_attendees INT DEFAULT 0,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_event_date (event_date),
        INDEX idx_published (is_published),
        INDEX idx_category (category_id)
      )
    `);
    
    // News table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        category_id VARCHAR(36),
        image_url VARCHAR(500),
        author VARCHAR(100) NOT NULL,
        author_role ENUM('priest', 'secretary', 'reporter', 'vice_secretary') NOT NULL,
        is_published BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        published_at TIMESTAMP NULL,
        archived_at TIMESTAMP NULL,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_published (is_published),
        INDEX idx_archived (is_archived),
        INDEX idx_category (category_id),
        INDEX idx_author_role (author_role),
        INDEX idx_published_at (published_at),
        FULLTEXT idx_content (title, summary, content)
      )
    `);
    
    // Gallery table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gallery (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        category_id VARCHAR(36),
        event_id VARCHAR(36),
        is_featured BOOLEAN DEFAULT false,
        upload_date DATE NOT NULL,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_featured (is_featured),
        INDEX idx_upload_date (upload_date),
        INDEX idx_category (category_id)
      )
    `);
    
    // Contact information table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        emergency_contact VARCHAR(20),
        office_hours_weekday VARCHAR(100),
        office_hours_saturday VARCHAR(100),
        office_hours_sunday VARCHAR(100),
        updated_by VARCHAR(36),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Mass schedule table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mass_schedule (
        id VARCHAR(36) PRIMARY KEY,
        day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
        time TIME NOT NULL,
        language ENUM('english', 'isindebele', 'both') DEFAULT 'english',
        type ENUM('mass', 'confession', 'adoration', 'rosary') DEFAULT 'mass',
        is_active BOOLEAN DEFAULT true,
        updated_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_day_time (day_of_week, time),
        INDEX idx_active (is_active)
      )
    `);
    
    // Prayer intentions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS prayer_intentions (
        id VARCHAR(36) PRIMARY KEY,
        intention TEXT NOT NULL,
        requester_name VARCHAR(100),
        requester_email VARCHAR(100),
        is_anonymous BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        is_urgent BOOLEAN DEFAULT false,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_by VARCHAR(36),
        approved_at TIMESTAMP NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_approved (is_approved),
        INDEX idx_urgent (is_urgent),
        INDEX idx_submitted (submitted_at)
      )
    `);
    
    // Ministries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ministries (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        leader_name VARCHAR(100),
        leader_contact VARCHAR(100),
        meeting_schedule VARCHAR(255),
        requirements TEXT,
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_active (is_active),
        INDEX idx_name (name)
      )
    `);
    
    // Sacraments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sacraments (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        requirements TEXT,
        preparation_time VARCHAR(100),
        contact_person VARCHAR(100),
        contact_info VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_active (is_active),
        INDEX idx_name (name)
      )
    `);
    
    // Analytics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id VARCHAR(36) PRIMARY KEY,
        page_path VARCHAR(255) NOT NULL,
        visitor_ip VARCHAR(45),
        user_agent TEXT,
        referrer VARCHAR(500),
        session_id VARCHAR(100),
        visit_date DATE NOT NULL,
        visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_page_path (page_path),
        INDEX idx_visit_date (visit_date),
        INDEX idx_session (session_id)
      )
    `);
    
    // File uploads table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_uploads (
        id VARCHAR(36) PRIMARY KEY,
        original_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by VARCHAR(36),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_uploaded_by (uploaded_by),
        INDEX idx_upload_date (upload_date)
      )
    `);
    
    console.log('✅ Database tables initialized successfully');
    connection.release();
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Insert default data
const insertDefaultData = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if admin user exists
    const [adminUsers] = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    
    if (adminUsers.length === 0) {
      const bcrypt = require('bcryptjs');
      const { v4: uuidv4 } = require('uuid');
      
      // Create default admin user
      const adminId = uuidv4();
      const adminPassword = await bcrypt.hash('admin123', 12);
      
      await connection.execute(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active)
        VALUES (?, 'admin', 'admin@stpatricks.com', ?, 'System', 'Administrator', 'admin', true)
      `, [adminId, adminPassword]);
      
      const parishionerId = uuidv4();
      const parishionerPassword = await bcrypt.hash('parish123', 12);
      
      await connection.execute(`
        INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active)
        VALUES (?, 'parishioner', 'parishioner@stpatricks.com', ?, 'Test', 'Parishioner', 'parishioner', true)
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
      await connection.execute(`
        INSERT IGNORE INTO categories (id, name, type, description, is_active)
        VALUES (?, ?, ?, ?, true)
      `, [uuidv4(), category.name, category.type, category.description]);
    }
    
    // Insert default contact info
    const [contactExists] = await connection.execute('SELECT id FROM contact_info LIMIT 1');
    if (contactExists.length === 0) {
      const { v4: uuidv4 } = require('uuid');
      await connection.execute(`
        INSERT INTO contact_info (id, phone, email, address, emergency_contact, office_hours_weekday, office_hours_saturday, office_hours_sunday)
        VALUES (?, '+263 9 123456', 'info@stpatricks.com', 'Makokoba, Bulawayo, Zimbabwe', '+263 9 654321', '8:00 AM - 5:00 PM', '8:00 AM - 12:00 PM', 'After Mass')
      `, [uuidv4()]);
    }
    
    console.log('✅ Default data inserted successfully');
    connection.release();
    
  } catch (error) {
    console.error('❌ Failed to insert default data:', error);
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  insertDefaultData,
  execute: (query, params) => pool.execute(query, params),
  query: (query, params) => pool.query(query, params)
};
