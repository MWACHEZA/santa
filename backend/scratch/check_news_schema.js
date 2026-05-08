const db = require('../config/database');

async function checkSchema() {
  try {
    const [rows] = await db.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'themes_of_year'
      ORDER BY ordinal_position;
    `);
    console.log('Columns in news table:');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('Error checking schema:', err);
    process.exit(1);
  }
}

checkSchema();
