const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'st_patricks_church',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Helper to convert '?' placeholders to '$1, $2, ...'
const convertPlaceholders = (sql) => {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
};

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
  execute: async (sql, params = []) => {
    const convertedSql = convertPlaceholders(sql);
    const res = await pool.query(convertedSql, params);
    // Return rows as first element to match mysql2's execute result format [rows, fields]
    return [res.rows, res.fields];
  },
  query: async (sql, params = []) => {
    const convertedSql = convertPlaceholders(sql);
    const res = await pool.query(convertedSql, params);
    return [res.rows, res.fields];
  }
};
