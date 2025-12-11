import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Read and execute SQL file
 */
async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`✅ Executed: ${path.basename(filePath)}`);
    return true;
  } catch (err) {
    console.error(`❌ Error executing ${path.basename(filePath)}:`, err.message);
    throw err;
  }
}

/**
 * Run all migration files in order
 */
async function runMigrations() {
  console.log('\n📦 Running database migrations...\n');
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    await executeSQLFile(filePath);
  }
  
  console.log('\n✅ All migrations completed successfully!\n');
}

/**
 * Run all seed files in order
 */
async function runSeeds() {
  console.log('\n🌱 Running database seeds...\n');
  
  const seedsDir = path.join(__dirname, 'seeds');
  
  if (!fs.existsSync(seedsDir)) {
    console.log('⚠️  No seeds directory found, skipping...');
    return;
  }
  
  const files = fs.readdirSync(seedsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    const filePath = path.join(seedsDir, file);
    await executeSQLFile(filePath);
  }
  
  console.log('\n✅ All seeds completed successfully!\n');
}

/**
 * Drop all tables (use with caution!)
 */
async function dropAllTables() {
  console.log('\n⚠️  Dropping all tables...\n');
  
  const dropSQL = `
    DROP TABLE IF EXISTS budgets CASCADE;
    DROP TABLE IF EXISTS transactions CASCADE;
    DROP TABLE IF EXISTS receipts CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS create_default_categories(INTEGER) CASCADE;
  `;
  
  try {
    await pool.query(dropSQL);
    console.log('✅ All tables dropped successfully!\n');
  } catch (err) {
    console.error('❌ Error dropping tables:', err.message);
    throw err;
  }
}

/**
 * Display database statistics
 */
async function showStats() {
  console.log('\n📊 Database Statistics:\n');
  
  const statsQuery = `
    SELECT 
      'users' as table_name, COUNT(*) as count FROM users
    UNION ALL
    SELECT 'categories', COUNT(*) FROM categories
    UNION ALL
    SELECT 'receipts', COUNT(*) FROM receipts
    UNION ALL
    SELECT 'transactions', COUNT(*) FROM transactions
    UNION ALL
    SELECT 'budgets', COUNT(*) FROM budgets
    ORDER BY table_name;
  `;
  
  try {
    const result = await pool.query(statsQuery);
    console.table(result.rows);
  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
  }
}

/**
 * Main setup function
 */
async function setup() {
  console.log('\n🚀 Starting database setup...\n');
  
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('\n❌ Cannot connect to database. Please check your DATABASE_URL in .env file.\n');
      process.exit(1);
    }
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'migrate':
        await runMigrations();
        break;
        
      case 'seed':
        await runSeeds();
        break;
        
      case 'reset':
        await dropAllTables();
        await runMigrations();
        await runSeeds();
        break;
        
      case 'fresh':
        await dropAllTables();
        await runMigrations();
        break;
        
      case 'stats':
        await showStats();
        break;
        
      default:
        // Default: run migrations and seeds
        await runMigrations();
        await runSeeds();
    }
    
    await showStats();
    
    console.log('\n✅ Database setup completed successfully!\n');
    
  } catch (err) {
    console.error('\n❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setup();

