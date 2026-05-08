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
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(tables.rows.map(r => r.table_name));

    console.log('\n--- CATEGORIES COLUMNS ---');
    const catCols = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'categories'");
    console.table(catCols.rows);

    console.log('\n--- EVENTS COLUMNS ---');
    const eventCols = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'events'");
    console.table(eventCols.rows);

    console.log('\n--- CUSTOM TYPES (ENUMS) ---');
    const types = await client.query("SELECT n.nspname as schema, t.typname as type FROM pg_type t LEFT JOIN pg_namespace n ON n.oid = t.typnamespace WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_class c WHERE c.oid = t.typrelid)) AND NOT EXISTS(SELECT 1 FROM pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid) AND n.nspname NOT IN ('pg_catalog', 'information_schema')");
    console.table(types.rows);

    for (const type of types.rows) {
      if (type.type.includes('type') || type.type.includes('role')) {
        console.log(`\n--- ENUM VALUES FOR ${type.type} ---`);
        const values = await client.query(`SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = $1`, [type.type]);
        console.table(values.rows);
      }
    }

    await client.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspect();
