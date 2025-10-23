const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

/**
 * Sync NFL 2025 schedule from local SQLite to Turso database
 */

async function syncScheduleToTurso() {
  try {
    console.log('🔄 Syncing NFL 2025 schedule to Turso database...');
    
    // Check for environment variables
    const tursoUrl = process.env.TURSO_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!tursoUrl || !tursoToken) {
      console.error('❌ Missing TURSO_URL or TURSO_AUTH_TOKEN environment variables');
      console.log('💡 Make sure to set these in your .env.local file or environment');
      return;
    }
    
    // Connect to Turso
    console.log('📡 Connecting to Turso database...');
    const turso = createClient({
      url: tursoUrl,
      authToken: tursoToken
    });
    
    // Create the schedule table in Turso
    console.log('🗄️ Creating 2025_season_schedule table in Turso...');
    
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS season_schedule_2025 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT UNIQUE NOT NULL,
        season INTEGER NOT NULL,
        week INTEGER NOT NULL,
        game_date TEXT NOT NULL,
        game_time TEXT,
        home_team_id TEXT NOT NULL,
        home_team_name TEXT NOT NULL,
        home_team_abbr TEXT NOT NULL,
        home_score INTEGER,
        away_team_id TEXT NOT NULL,
        away_team_name TEXT NOT NULL,
        away_team_abbr TEXT NOT NULL,
        away_score INTEGER,
        venue_name TEXT,
        venue_city TEXT,
        venue_state TEXT,
        venue_capacity INTEGER,
        venue_indoor BOOLEAN,
        broadcast_primary TEXT,
        broadcast_all TEXT,
        broadcast_networks TEXT,
        status TEXT NOT NULL,
        game_type TEXT DEFAULT 'regular',
        weather_temperature INTEGER,
        weather_condition TEXT,
        weather_humidity INTEGER,
        weather_wind_speed INTEGER,
        weather_wind_direction TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    console.log('🔍 Creating indexes in Turso...');
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_schedule_date ON season_schedule_2025(game_date)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_schedule_week ON season_schedule_2025(week)`);
    await turso.execute(`CREATE INDEX IF NOT EXISTS idx_schedule_teams ON season_schedule_2025(home_team_id, away_team_id)`);
    
    // Read schedule data from local file
    const schedulePath = path.join(__dirname, '..', 'data', 'nfl-2025-schedule.json');
    
    if (!fs.existsSync(schedulePath)) {
      console.log('❌ Schedule file not found. Please run fetch-nfl-schedule.js first.');
      return;
    }
    
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    console.log(`📊 Found ${scheduleData.length} games to sync to Turso`);
    
    // Clear existing data (optional - you might want to keep existing data)
    console.log('🧹 Clearing existing schedule data in Turso...');
    await turso.execute(`DELETE FROM season_schedule_2025`);
    
    // Insert games in batches
    const batchSize = 50;
    let insertedCount = 0;
    
    console.log('📝 Inserting games into Turso...');
    
    for (let i = 0; i < scheduleData.length; i += batchSize) {
      const batch = scheduleData.slice(i, i + batchSize);
      
      // Prepare comprehensive batch insert
      const values = batch.map(game => {
        const escape = (str) => str ? `'${str.toString().replace(/'/g, "''")}'` : 'NULL';
        const escapeBool = (val) => val === true ? '1' : val === false ? '0' : 'NULL';
        
        return `(
          ${escape(game.game_id)}, ${game.season}, ${game.week}, 
          ${escape(game.game_date)}, ${escape(game.game_time)},
          ${escape(game.home_team_id)}, ${escape(game.home_team_name)}, ${escape(game.home_team_abbr)}, ${game.home_score || 'NULL'},
          ${escape(game.away_team_id)}, ${escape(game.away_team_name)}, ${escape(game.away_team_abbr)}, ${game.away_score || 'NULL'},
          ${escape(game.venue?.name)}, ${escape(game.venue?.city)}, ${escape(game.venue?.state)}, ${game.venue?.capacity || 'NULL'}, ${escapeBool(game.venue?.indoor)},
          ${escape(game.broadcast?.primary)}, ${escape(game.broadcast?.all)}, ${escape(game.broadcast?.networks ? game.broadcast.networks.join(', ') : null)},
          ${escape(game.status)}, ${escape(game.game_type)},
          ${game.weather?.temperature || 'NULL'}, ${escape(game.weather?.condition)}, ${game.weather?.humidity || 'NULL'}, ${game.weather?.wind_speed || 'NULL'}, ${escape(game.weather?.wind_direction)},
          ${escape(game.created_at)}
        )`;
      }).join(',');
      
      const insertQuery = `
        INSERT OR REPLACE INTO season_schedule_2025 (
          game_id, season, week, game_date, game_time,
          home_team_id, home_team_name, home_team_abbr, home_score,
          away_team_id, away_team_name, away_team_abbr, away_score,
          venue_name, venue_city, venue_state, venue_capacity, venue_indoor,
          broadcast_primary, broadcast_all, broadcast_networks,
          status, game_type,
          weather_temperature, weather_condition, weather_humidity, weather_wind_speed, weather_wind_direction,
          created_at
        ) VALUES ${values}
      `;
      
      try {
        await turso.execute(insertQuery);
        insertedCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(scheduleData.length / batchSize)} (${insertedCount}/${scheduleData.length} games)`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully synced ${insertedCount} games to Turso`);
    
    // Verify the data
    console.log('🔍 Verifying data in Turso...');
    const result = await turso.execute(`SELECT COUNT(*) as count FROM season_schedule_2025`);
    const count = result.rows[0].count;
    console.log(`📊 Total games in Turso: ${count}`);
    
    // Show some sample data
    const sampleResult = await turso.execute(`
      SELECT game_id, week, game_date, home_team_name, away_team_name, status
      FROM season_schedule_2025
      ORDER BY game_date
      LIMIT 5
    `);
    
    console.log('📅 Sample games in Turso:');
    sampleResult.rows.forEach(row => {
      console.log(`  - Week ${row.week}: ${row.away_team_name} @ ${row.home_team_name} (${row.game_date}) - ${row.status}`);
    });
    
    console.log('🎉 Schedule sync to Turso completed successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing schedule to Turso:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  syncScheduleToTurso()
    .then(() => {
      console.log('✅ NFL 2025 schedule successfully synced to Turso!');
    })
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncScheduleToTurso };
