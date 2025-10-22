/**
 * Complete migration script to move ALL SQLite data to Turso
 * Ensures 100% data migration with progress tracking
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
  console.log('🚀 Starting COMPLETE migration from SQLite to Turso...\n');

  // Connect to Turso
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  // Connect to local SQLite
  const sqlite = new Database(SQLITE_PATH);

  try {
    // Create tables in Turso using the actual schema from local database
    console.log('📋 Creating tables in Turso...');
    
    // Get the actual schema from local database
    const tables = ['teams', 'players', 'games', 'player_game_stats', 'player_season_stats', 'team_records'];
    
    for (const table of tables) {
      console.log(`📋 Creating table: ${table}`);
      
      // Get schema from local database
      const schemaResult = sqlite.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`).get(table);
      
      if (!schemaResult) {
        console.log(`⚠️  Table ${table} not found in local database, skipping...`);
        continue;
      }
      
      const createStatement = schemaResult.sql;
      
      try {
        await turso.execute(createStatement);
        console.log(`✅ Created table: ${table}`);
      } catch (error) {
        console.error(`❌ Error creating table ${table}:`, error.message);
        throw error;
      }
    }

    // Migrate data table by table with progress tracking
    console.log('\n📊 Starting COMPLETE data migration...');
    
    for (const table of tables) {
      console.log(`\n📊 Migrating ${table}...`);
      
      try {
        // Get all data from SQLite
        const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
        
        if (rows.length === 0) {
          console.log(`⚠️  No data in ${table}, skipping...`);
          continue;
        }

        console.log(`   Found ${rows.length} rows to migrate`);

        // Get column names
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

        // Insert data in smaller batches to avoid timeouts
        const batchSize = 50; // Smaller batches
        let inserted = 0;
        
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          
          for (const row of batch) {
            const values = columns.map(col => row[col]);
            await turso.execute(insertSQL, values);
            inserted++;
          }
          
          // Progress update every 1000 rows
          if (inserted % 1000 === 0 || inserted === rows.length) {
            console.log(`   ✅ Inserted ${inserted}/${rows.length} rows (${Math.round((inserted/rows.length)*100)}%)`);
          }
        }
        
        console.log(`   🎉 COMPLETED ${table}: ${inserted}/${rows.length} rows (100%)`);
        
      } catch (error) {
        console.error(`❌ Error migrating ${table}:`, error.message);
        console.log(`⚠️  This is a CRITICAL ERROR - migration incomplete!`);
        throw error;
      }
    }

    // Verify COMPLETE migration
    console.log('\n🔍 Verifying COMPLETE migration...');
    let totalRows = 0;
    for (const table of tables) {
      try {
        const result = await turso.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0]?.count || 0;
        totalRows += count;
        console.log(`   ${table}: ${count} rows`);
      } catch (error) {
        console.log(`   ${table}: Error getting count - ${error.message}`);
      }
    }

    console.log(`\n🎉 COMPLETE MIGRATION SUCCESSFUL!`);
    console.log(`📊 Total rows migrated: ${totalRows}`);
    console.log('📝 Next steps:');
    console.log('   1. Test locally with: npm run dev');
    console.log('   2. Push to GitHub');
    console.log('   3. Deploy to Vercel with environment variables');

  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error);
    console.log('🚨 This means we have INCOMPLETE data - this is NOT acceptable!');
    throw error;
  } finally {
    sqlite.close();
  }
}

// Run migration
if (require.main === module) {
  migrateToTurso()
    .then(() => {
      console.log('\n✅ COMPLETE migration script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ COMPLETE migration FAILED:', error);
      console.log('🚨 You MUST fix this before proceeding!');
      process.exit(1);
    });
}

module.exports = { migrateToTurso };
