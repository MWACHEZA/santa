#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  database: 'postgres' // Connect to default postgres db first
};

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  try {
    // Test basic connection
    console.log('📡 Testing PostgreSQL connection...');
    const client = new Client(dbConfig);
    await client.connect();
    console.log('✅ PostgreSQL connection successful!');
    
    // Check if database exists
<<<<<<< HEAD
    const dbName = process.env.DB_NAME || 'st_patricks_db';
    console.log(`\n📊 Checking database '${dbName}'...`);
    const dbRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    
    if (dbRes.rowCount > 0) {
      console.log(`✅ Database '${dbName}' exists!`);
      await client.end();

      // Reconnect to the actual database
      const dbClient = new Client({
        ...dbConfig,
        database: dbName
      });
      await dbClient.connect();
=======
    console.log('\n📊 Checking database...');
    const dbName = process.env.DB_NAME || 'st_patricks_db';
    const [databases] = await connection.execute(
      'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName]
    );
    
    if (databases.length > 0) {
      console.log(`✅ Database '${dbName}' exists!`);
      
      // Use the database
      await connection.query(`USE \`${dbName}\``);
>>>>>>> 59124fe9bac7e6937579955e0d27d1c221fc2546
      
      // Check tables
      console.log('\n📋 Checking tables...');
      const tablesRes = await dbClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      if (tablesRes.rowCount > 0) {
        console.log(`✅ Found ${tablesRes.rowCount} tables:`);
        tablesRes.rows.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
        
        // Check for users
        console.log('\n👥 Checking default users...');
        const usersRes = await dbClient.query('SELECT username, role FROM users LIMIT 5');
        
        if (usersRes.rowCount > 0) {
          console.log(`✅ Found ${usersRes.rowCount} users:`);
          usersRes.rows.forEach(user => {
            console.log(`   - ${user.username} (${user.role})`);
          });
        } else {
          console.log('⚠️  No users found in database');
        }
        
      } else {
        console.log('⚠️  Database exists but no tables found');
        console.log('💡 Run the backend server to initialize tables');
      }
      await dbClient.end();
      
    } else {
      console.log(`⚠️  Database '${dbName}' does not exist`);
      console.log('💡 Run the backend server to create the database');
      await client.end();
    }
    
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
      console.log('   1. Make sure PostgreSQL is installed and running');
      console.log('   2. Check if PostgreSQL service is started');
      console.log('   3. Verify connection details in .env file');
      console.log('   4. Default port is 5432, make sure it\'s not blocked');
    } else if (error.code === '28P01' || error.code === '28000') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check your DB_USER and DB_PASSWORD in .env file');
      console.log('   2. Make sure the PostgreSQL user has proper permissions');
    }
    
    process.exit(1);
  }
}

// Run the check
checkDatabase();
