const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Load database configuration from config.json
 */
function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Database config file not found: ${configPath}\n` +
      `Please copy database/config.example.json to database/config.json and update with your database credentials.`
    );
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config;
}

/**
 * Create and export PostgreSQL connection pool
 */
let pool = null;

function getPool() {
  if (!pool) {
    const config = loadConfig();
    pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Close the connection pool
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  closePool,
};
