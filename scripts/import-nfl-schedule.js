const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

/**
 * Import NFL 2025 schedule into database
 * Creates 2025_season_schedule table and populates it
 */

async function importNFLSchedule() {
  try {
    console.log('📅 Importing NFL 2025 schedule into database...');
    
    // Read the schedule data
    const schedulePath = path.join(__dirname, '..', 'data', 'nfl-2025-schedule.json');
    
    if (!fs.existsSync(schedulePath)) {
      console.log('❌ Schedule file not found. Please run fetch-nfl-schedule.js first.');
      return;
    }
    
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    console.log(`📊 Found ${scheduleData.length} games to import`);
    
    // Connect to local SQLite database
    const dbPath = path.join(__dirname, '..', 'data', 'nfl.db');
    const db = new Database(dbPath);
    
    console.log('🗄️ Creating 2025_season_schedule table...');
    
    // Create the comprehensive schedule table
    db.exec(`
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
    
    console.log('📝 Inserting games into database...');
    
    // Prepare comprehensive insert statement
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO season_schedule_2025 (
        game_id, season, week, game_date, game_time,
        home_team_id, home_team_name, home_team_abbr, home_score,
        away_team_id, away_team_name, away_team_abbr, away_score,
        venue_name, venue_city, venue_state, venue_capacity, venue_indoor,
        broadcast_primary, broadcast_all, broadcast_networks,
        status, game_type,
        weather_temperature, weather_condition, weather_humidity, weather_wind_speed, weather_wind_direction,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let insertedCount = 0;
    let errorCount = 0;
    
    for (const game of scheduleData) {
      try {
        insertStmt.run(
          game.game_id,
          game.season,
          game.week,
          game.game_date,
          game.game_time,
          game.home_team_id,
          game.home_team_name,
          game.home_team_abbr,
          game.home_score,
          game.away_team_id,
          game.away_team_name,
          game.away_team_abbr,
          game.away_score,
          game.venue?.name || null,
          game.venue?.city || null,
          game.venue?.state || null,
          game.venue?.capacity || null,
          game.venue?.indoor || null,
          game.broadcast?.primary || null,
          game.broadcast?.all || null,
          game.broadcast?.networks ? game.broadcast.networks.join(', ') : null,
          game.status,
          game.game_type,
          game.weather?.temperature || null,
          game.weather?.condition || null,
          game.weather?.humidity || null,
          game.weather?.wind_speed || null,
          game.weather?.wind_direction || null,
          game.created_at
        );
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error inserting game ${game.game_id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Successfully imported ${insertedCount} games`);
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} games had errors`);
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_schedule_date ON season_schedule_2025(game_date);
      CREATE INDEX IF NOT EXISTS idx_schedule_week ON season_schedule_2025(week);
      CREATE INDEX IF NOT EXISTS idx_schedule_teams ON season_schedule_2025(home_team_id, away_team_id);
    `);
    
    // Show some stats
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_games,
        COUNT(DISTINCT week) as total_weeks,
        MIN(game_date) as first_game,
        MAX(game_date) as last_game
      FROM season_schedule_2025
    `).get();
    
    console.log('📊 Schedule Statistics:');
    console.log(`  Total Games: ${stats.total_games}`);
    console.log(`  Total Weeks: ${stats.total_weeks}`);
    console.log(`  First Game: ${stats.first_game}`);
    console.log(`  Last Game: ${stats.last_game}`);
    
    // Show games by week
    const weekStats = db.prepare(`
      SELECT week, COUNT(*) as game_count
      FROM season_schedule_2025
      GROUP BY week
      ORDER BY week
    `).all();
    
    console.log('📅 Games by Week:');
    weekStats.forEach(week => {
      console.log(`  Week ${week.week}: ${week.game_count} games`);
    });
    
    db.close();
    console.log('✅ Schedule import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing schedule:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  importNFLSchedule()
    .then(() => {
      console.log('🎉 NFL 2025 schedule successfully imported!');
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importNFLSchedule };
