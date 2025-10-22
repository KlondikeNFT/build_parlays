/**
 * Clear Turso database completely
 * Run this before doing a fresh migration
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
    // Get all table names
    const tables = ['teams', 'players', 'games', 'player_game_stats', 'player_season_stats', 'team_records'];
    
    console.log('📋 Clearing all tables...');
    
    for (const table of tables) {
      try {
        await turso.execute(`DELETE FROM ${table}`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table} might not exist or already empty: ${error.message}`);
      }
    }

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
