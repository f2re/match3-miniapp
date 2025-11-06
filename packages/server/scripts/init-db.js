const { execSync } = require('child_process');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'match3';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

async function initDatabase() {
  console.log(' 🗄️  Initializing Match-3 Telegram Mini App database...');

  // Check if database exists
  const dbExists = await checkDatabaseExists();
  
  if (!dbExists) {
    console.log(` 🚩 Database ${DB_NAME} does not exist. Creating...`);
    try {
      execSync(`createdb ${DB_NAME} -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT}`, {
        stdio: 'inherit',
        env: { ...process.env, PGPASSWORD: DB_PASSWORD }
      });
      console.log(` ✅ Database ${DB_NAME} created successfully!`);
    } catch (error) {
      console.error(` ❌ Error creating database: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log(` ✅ Database ${DB_NAME} already exists.`);
  }

  // Run migrations
  console.log(' 🚀 Running database migrations...');
  try {
    execSync('npx knex migrate:latest', {
      cwd: __dirname + '/..',
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: DB_PASSWORD }
    });
    console.log(' ✅ Migrations completed successfully!');
  } catch (error) {
    console.error(` ❌ Error running migrations: ${error.message}`);
    process.exit(1);
  }

  // Run seeds if they exist
  console.log(' 🌱 Running database seeds...');
  try {
    execSync('npx knex seed:run', {
      cwd: __dirname + '/..',
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: DB_PASSWORD }
    });
    console.log(' ✅ Seeds completed successfully!');
  } catch (error) {
    console.warn(` ⚠️  No seeds found or error running seeds: ${error.message}`);
    console.log('    This is OK if you don\'t have seed files yet.');
  }

  console.log(' 🎉 Database initialization completed successfully!');
}

async function checkDatabaseExists() {
  const client = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: 'postgres', // Connect to default postgres DB to check if our DB exists
    password: DB_PASSWORD,
    port: DB_PORT,
  });

  try {
    const result = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}';
    `);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error checking if database exists:', error);
    return false;
  } finally {
    await client.end();
  }
}

// Run the initialization
if (require.main === module) {
  initDatabase().catch(error => {
    console.error(' ❌ Database initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { initDatabase, checkDatabaseExists };