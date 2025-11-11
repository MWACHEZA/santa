#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  try {
    // Test basic connection
    console.log('📡 Testing MySQL connection...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL connection successful!');
    
    // Check if database exists
    console.log('\n📊 Checking database...');
    const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'st_patricks_church']);
    
    if (databases.length > 0) {
      console.log(`✅ Database '${process.env.DB_NAME || 'st_patricks_church'}' exists!`);
      
      // Use the database
      await connection.execute(`USE ${process.env.DB_NAME || 'st_patricks_church'}`);
      
      // Check tables
      console.log('\n📋 Checking tables...');
      const [tables] = await connection.execute('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
          console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Check for users
        console.log('\n👥 Checking default users...');
        const [users] = await connection.execute('SELECT username, role FROM users LIMIT 5');
        
        if (users.length > 0) {
          console.log(`✅ Found ${users.length} users:`);
          users.forEach(user => {
            console.log(`   - ${user.username} (${user.role})`);
          });
        } else {
          console.log('⚠️  No users found in database');
        }
        
      } else {
        console.log('⚠️  Database exists but no tables found');
        console.log('💡 Run the backend server to initialize tables');
      }
      
    } else {
      console.log(`⚠️  Database '${process.env.DB_NAME || 'st_patricks_church'}' does not exist`);
      console.log('💡 Run the backend server to create the database');
    }
    
    await connection.end();
    
    console.log('\n🎉 Database check completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. If database/tables are missing, start the backend server: npm run dev');
    console.log('   2. The backend will automatically create the database and tables');
    console.log('   3. Default users will be created: admin/admin123 and parishioner/parish123');
    
  } catch (error) {
    console.error('❌ Database check failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure MySQL/MariaDB is installed and running');
      console.log('   2. Check if MySQL service is started');
      console.log('   3. Verify connection details in .env file');
      console.log('   4. Default port is 3306, make sure it\'s not blocked');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your DB_USER and DB_PASSWORD in .env file');
      console.log('   2. Make sure the MySQL user has proper permissions');
      console.log('   3. Try connecting with MySQL command line to verify credentials');
    }
    
    process.exit(1);
  }
}

// Run the check
checkDatabase();
