const db = require('../config/database-simple');

async function check() {
  try {
    const [rows] = await db.execute("SELECT username, is_active, role FROM users");
    console.log('All users from database-simple:', rows);
    
    // Check with the exact query from BASE_USER_QUERY
    const USER_SELECT_FIELDS = `
      u.id,
      u.username,
      u.is_active AS "isActive"
    `;
    const [loginRows] = await db.execute(`SELECT ${USER_SELECT_FIELDS} FROM users u`);
    console.log('User rows with aliases:', loginRows);
    
  } catch (err) {
    console.error(err);
  }
}

check();
