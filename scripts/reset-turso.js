/**
 * Reset Turso database completely - DROP and recreate tables
 */

const { createClient } = require('@libsql/client');

// Configuration - Your Turso credentials (read/write)
const TURSO_URL = process.env.TURSO_URL || 'libsql://nfs-data-klondikenft.aws-us-east-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjEwODQzMDYsImlkIjoiN2Y4MjE4N2QtZDAyZC00MGMxLWJiNmItYWEzMjcxNjVhMTA4IiwicmlkIjoiYWIyMjBkNmItMzVmYi00MWFmLWIyZTAtNDU0YzRiNTkzNmE4In0.oXkUV5lsIoHNd1lHEbauCuSCqRVF9RMXcYHP8Bcatw38UI7nT014Whoe1cXI3uY_cvD1PSW2UNBEFkmvBUj4CQ';

async function resetTurso() {
  console.log('🗑️  RESETTING Turso database completely...\n');

  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  try {
    // Drop all tables in reverse dependency order
    const tables = [
      'player_game_stats',    // References players and games
      'player_season_stats',  // References players
      'team_records',         // References teams
      'games',                // References teams
      'players',              // References teams
      'teams'                 // Base table
    ];
    
    console.log('📋 Dropping all tables...');
    
    for (const table of tables) {
      try {
        await turso.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Table ${table}: ${error.message}`);
      }
    }

    console.log('\n🎉 Turso database RESET successfully!');
    console.log('📝 Ready for fresh 100% migration');

  } catch (error) {
    console.error('❌ Error resetting Turso database:', error);
    throw error;
  }
}

// Run reset
if (require.main === module) {
  resetTurso()
    .then(() => {
      console.log('\n✅ Reset script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Reset failed:', error);
      process.exit(1);
    });
}

module.exports = { resetTurso };
