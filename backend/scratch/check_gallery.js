const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT });
pool.query("SELECT id, title, image_url, is_featured, category_id FROM gallery LIMIT 10").then(r => { console.log('Gallery rows:', JSON.stringify(r.rows, null, 2)); pool.end(); }).catch(e => { console.error(e.message); pool.end(); });
