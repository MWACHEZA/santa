const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'santana',
  database: 'st_patricks_db',
  port: 5432,
  ssl: false
});

async function run() {
  const res = await pool.query("SELECT username, password_hash FROM users WHERE username IN ('admin', 'parishioner')");
  for (const row of res.rows) {
    console.log(`User: ${row.username}`);
    const passwords = ['admin123', 'parish123', 'parishioner123'];
    for (const p of passwords) {
      const match = await bcrypt.compare(p, row.password_hash);
      console.log(`  Testing '${p}': ${match}`);
    }
  }
  await pool.end();
}

run();
