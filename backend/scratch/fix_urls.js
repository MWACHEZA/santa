const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'santana',
  database: 'st_patricks_db',
  port: 5432,
  ssl: false
});

async function fixUrls() {
  try {
    console.log('Starting URL cleanup in database...');
    
    // Fix gallery image URLs
    const galleryRes = await pool.query("UPDATE gallery SET image_url = REPLACE(image_url, 'http://localhost:5000', '') WHERE image_url LIKE 'http://localhost:5000%'");
    console.log(`Updated ${galleryRes.rowCount} gallery images.`);
    
    // Fix ministries image URLs
    const ministryRes = await pool.query("UPDATE ministries SET image_url = REPLACE(image_url, 'http://localhost:5000', '') WHERE image_url LIKE 'http://localhost:5000%'");
    console.log(`Updated ${ministryRes.rowCount} ministries.`);
    
    // Fix news image URLs
    const newsRes = await pool.query("UPDATE news SET image_url = REPLACE(image_url, 'http://localhost:5000', '') WHERE image_url LIKE 'http://localhost:5000%'");
    console.log(`Updated ${newsRes.rowCount} news items.`);
    
    // Fix priest messages image URLs
    const priestRes = await pool.query("UPDATE priest_messages SET image_url = REPLACE(image_url, 'http://localhost:5000', '') WHERE image_url LIKE 'http://localhost:5000%'");
    console.log(`Updated ${priestRes.rowCount} priest messages.`);
    
    // Fix themes of year image URLs
    const themeRes = await pool.query("UPDATE themes_of_year SET image_url = REPLACE(image_url, 'http://localhost:5000', '') WHERE image_url LIKE 'http://localhost:5000%'");
    console.log(`Updated ${themeRes.rowCount} themes.`);

    console.log('URL cleanup completed successfully.');
  } catch (err) {
    console.error('Error during URL cleanup:', err);
  } finally {
    await pool.end();
  }
}

fixUrls();
