/**
 * db.js — MySQL2 connection pool
 * Uses environment variables loaded by dotenv.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'store_rating_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

// Quick connectivity check on startup
pool.getConnection()
  .then((conn) => {
    console.log('[DB] MySQL connection pool established.');
    conn.release();
  })
  .catch((err) => {
    console.error('[DB] Failed to connect to MySQL:', err.message);
    process.exit(1);
  });

module.exports = pool;
