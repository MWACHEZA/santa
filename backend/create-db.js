const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  try {
    console.log('🔍 Creating database...');
    
    // Connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4'
    });
    
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS st_patricks_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created successfully');
    
    // Close connection and reconnect with database
    await connection.end();
    
    // Reconnect with database specified
    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'st_patricks_church',
      charset: 'utf8mb4'
    });
    
    // Create users table
    await dbConnection.execute(`
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
    console.log('✅ Users table created');
    
    // Insert default admin user (password: admin123)
    await dbConnection.execute(`
      INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin-uuid-1234',
      'admin',
      'admin@stpatricks.com',
      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.e',
      'System',
      'Administrator',
      'admin',
      true
    ]);
    
    // Insert default parishioner user (password: parish123)
    await dbConnection.execute(`
      INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'parish-uuid-1234',
      'parishioner',
      'parishioner@stpatricks.com',
      '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      'Test',
      'Parishioner',
      'parishioner',
      true
    ]);
    
    console.log('✅ Default users created');
    
    // Create categories table
    await dbConnection.execute(`
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
    console.log('✅ Categories table created');
    
    await dbConnection.end();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
};

createDatabase();
