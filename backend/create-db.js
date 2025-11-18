const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const createDatabase = async () => {
  try {
    console.log('🔍 Creating database...');
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
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
};

createDatabase();
