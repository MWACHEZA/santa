const { Client } = require('pg');
require('dotenv').config();

const inspect = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'st_patricks_db'
  });

  try {
    await client.connect();
    
    console.log('--- TABLES ---');
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log(tables.rows.map(r => r.table_name));

    console.log('\n--- CATEGORIES COLUMNS ---');
    const catCols = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'categories'");
    console.table(catCols.rows);

    await client.end();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

inspect();
