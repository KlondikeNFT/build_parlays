/**
 * Migration script to move SQLite data to Turso
 * Run this after setting up Turso database
 */

const Database = require('better-sqlite3');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Configuration - Your Turso credentials (read/write)
const TURSO_URL = process.env.TURSO_URL || 'libsql://nfs-data-klondikenft.aws-us-east-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjEwODQzMDYsImlkIjoiN2Y4MjE4N2QtZDAyZC00MGMxLWJiNmItYWEzMjcxNjVhMTA4IiwicmlkIjoiYWIyMjBkNmItMzVmYi00MWFmLWIyZTAtNDU0YzRiNTkzNmE4In0.oXkUV5lsIoHNd1lHEbauCuSCqRVF9RMXcYHP8Bcatw38UI7nT014Whoe1cXI3uY_cvD1PSW2UNBEFkmvBUj4CQ';

// Local SQLite database path
const SQLITE_PATH = path.join(__dirname, '..', 'data', 'nfl.db');

async function migrateToTurso() {
  console.log('🚀 Starting migration from SQLite to Turso...\n');

  // Connect to Turso
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  // Connect to local SQLite
  const sqlite = new Database(SQLITE_PATH);

  try {
    // Read schema from SQLite and create tables in Turso
    console.log('📋 Creating tables in Turso...');
    const schemaPath = path.join(__dirname, '..', 'lib', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split and execute schema statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && stmt.toUpperCase().startsWith('CREATE'));

    for (const statement of statements) {
      try {
        await turso.execute(statement);
        console.log(`✅ Created table: ${statement.match(/CREATE TABLE.*?(\w+)/)?.[1] || 'unknown'}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Table already exists: ${statement.match(/CREATE TABLE.*?(\w+)/)?.[1] || 'unknown'}`);
        } else {
          throw error;
        }
      }
    }

    // Migrate data table by table
    const tables = ['teams', 'players', 'games', 'player_game_stats', 'player_season_stats', 'team_records'];
    
    for (const table of tables) {
      console.log(`\n📊 Migrating ${table}...`);
      
      try {
        // Get all data from SQLite
        const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        
        if (rows.length === 0) {
          console.log(`⚠️  No data in ${table}, skipping...`);
          continue;
        }

      // Get column names
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const insertSQL = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        for (const row of batch) {
          const values = columns.map(col => row[col]);
          await turso.execute(insertSQL, values);
        }
        
        console.log(`   ✅ Inserted ${Math.min(i + batchSize, rows.length)}/${rows.length} rows`);
      }
      
      } catch (error) {
        console.error(`❌ Error migrating ${table}:`, error.message);
        console.log(`⚠️  Skipping ${table} due to error...`);
        continue;
      }
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    for (const table of tables) {
      const result = await turso.execute(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result.rows[0]?.count || 0;
      console.log(`   ${table}: ${count} rows`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Update your .env.local with TURSO_URL and TURSO_AUTH_TOKEN');
    console.log('   2. Update database connection to use Turso');
    console.log('   3. Test locally with: npm run dev');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// Run migration
if (require.main === module) {
  migrateToTurso()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToTurso };
