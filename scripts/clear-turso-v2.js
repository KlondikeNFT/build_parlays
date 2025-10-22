/**
 * Clear Turso database completely
 * Handles foreign key constraints properly
 */

const { createClient } = require('@libsql/client');

// Configuration - Your Turso credentials (read/write)
const TURSO_URL = process.env.TURSO_URL || 'libsql://nfs-data-klondikenft.aws-us-east-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjEwODQzMDYsImlkIjoiN2Y4MjE4N2QtZDAyZC00MGMxLWJiNmItYWEzMjcxNjVhMTA4IiwicmlkIjoiYWIyMjBkNmItMzVmYi00MWFmLWIyZTAtNDU0YzRiNTkzNmE4In0.oXkUV5lsIoHNd1lHEbauCuSCqRVF9RMXcYHP8Bcatw38UI7nT014Whoe1cXI3uY_cvD1PSW2UNBEFkmvBUj4CQ';

async function clearTurso() {
  console.log('🗑️  Clearing Turso database completely...\n');

  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  try {
    // Disable foreign key constraints
    console.log('🔧 Disabling foreign key constraints...');
    await turso.execute('PRAGMA foreign_keys = OFF');
    
    // Clear tables in reverse dependency order
    const tables = [
      'player_game_stats',    // References players and games
      'player_season_stats',  // References players
      'team_records',         // References teams
      'games',                // References teams
      'players',              // References teams
      'teams'                 // Base table
    ];
    
    console.log('📋 Clearing all tables...');
    
    for (const table of tables) {
      try {
        await turso.execute(`DELETE FROM ${table}`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table}: ${error.message}`);
      }
    }

    // Re-enable foreign key constraints
    console.log('🔧 Re-enabling foreign key constraints...');
    await turso.execute('PRAGMA foreign_keys = ON');

    // Verify all tables are empty
    console.log('\n🔍 Verifying all tables are empty...');
    for (const table of tables) {
      try {
        const result = await turso.execute(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0]?.count || 0;
        console.log(`   ${table}: ${count} rows (should be 0)`);
      } catch (error) {
        console.log(`   ${table}: Error getting count - ${error.message}`);
      }
    }

    console.log('\n🎉 Turso database cleared successfully!');
    console.log('📝 Ready for fresh 100% migration');

  } catch (error) {
    console.error('❌ Error clearing Turso database:', error);
    throw error;
  }
}

// Run clear
if (require.main === module) {
  clearTurso()
    .then(() => {
      console.log('\n✅ Clear script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Clear failed:', error);
      process.exit(1);
    });
}

module.exports = { clearTurso };
