const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'st_patricks_db'
    });
    
    console.log('✅ Connected to database');
    
    // Check users table
    const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('📊 Total users:', users[0].count);
    
    // Show recent users
    const [recentUsers] = await db.execute('SELECT id, username, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('👥 Recent users:');
    recentUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Created: ${user.created_at}`);
    });
    
    // Check if test user exists
    const [testUser] = await db.execute('SELECT * FROM users WHERE email LIKE "%testuser%" ORDER BY created_at DESC LIMIT 1');
    if (testUser.length > 0) {
      console.log('🧪 Test user found:', testUser[0].email);
    } else {
      console.log('⚠️  No test users found');
    }
    
    await db.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkDatabase();