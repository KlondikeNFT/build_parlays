const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

async function importNFLOfficialSchedule() {
  try {
    console.log('📅 Importing official NFL 2025 schedule into database...');
    
    // Check if the NFL schedule file exists
    const schedulePath = path.join(__dirname, '..', 'data', 'nfl-2025-official-schedule.json');
    if (!fs.existsSync(schedulePath)) {
      throw new Error('NFL official schedule file not found. Please run parse-nfl-schedule.js first.');
    }
    
    // Read the schedule data
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    console.log(`📊 Found ${scheduleData.length} games to import`);
    
    // Connect to database
    const dbPath = path.join(__dirname, '..', 'data', 'nfl.db');
    const db = new Database(dbPath);
    
    // Create the official NFL schedule table
    console.log('🗄️ Creating nfl_official_schedule_2025 table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS nfl_official_schedule_2025 (
        game_id TEXT PRIMARY KEY,
        season INTEGER,
        week INTEGER,
        game_date TEXT,
        game_time TEXT,
        home_team_id TEXT,
        home_team_name TEXT,
        home_team_abbr TEXT,
        home_score INTEGER,
        away_team_id TEXT,
        away_team_name TEXT,
        away_team_abbr TEXT,
        away_score INTEGER,
        venue_name TEXT,
        venue_city TEXT,
        venue_state TEXT,
        venue_capacity INTEGER,
        venue_indoor BOOLEAN,
        broadcast_primary TEXT,
        broadcast_all TEXT,
        broadcast_networks TEXT,
        status TEXT,
        game_type TEXT,
        weather_temperature INTEGER,
        weather_condition TEXT,
        weather_humidity INTEGER,
        weather_wind_speed INTEGER,
        weather_wind_direction TEXT,
        created_at TEXT
      )
    `);
    
    // Clear existing data
    db.exec('DELETE FROM nfl_official_schedule_2025');
    
    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO nfl_official_schedule_2025 (
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
    
    // Insert games in batches
    console.log('📝 Inserting games into database...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const game of scheduleData) {
      try {
        insertStmt.run(
          game.game_id || null,
          game.season || null,
          game.week || null,
          game.game_date || null,
          game.game_time || null,
          game.home_team_id || null,
          game.home_team_name || null,
          game.home_team_abbr || null,
          game.home_score || null,
          game.away_team_id || null,
          game.away_team_name || null,
          game.away_team_abbr || null,
          game.away_score || null,
          game.venue_name || null,
          game.venue_city || null,
          game.venue_state || null,
          game.venue_capacity || null,
          game.venue_indoor ? 1 : 0,
          game.broadcast_primary || null,
          game.broadcast_all || null,
          game.broadcast_networks ? JSON.stringify(game.broadcast_networks) : null,
          game.status || null,
          game.game_type || null,
          game.weather_temperature || null,
          game.weather_condition || null,
          game.weather_humidity || null,
          game.weather_wind_speed || null,
          game.weather_wind_direction || null,
          game.created_at || new Date().toISOString()
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Error inserting game ${game.game_id}:`, error.message);
        errorCount++;
      }
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating database indexes...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_nfl_official_schedule_date ON nfl_official_schedule_2025(game_date)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_nfl_official_schedule_week ON nfl_official_schedule_2025(week)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_nfl_official_schedule_home_team ON nfl_official_schedule_2025(home_team_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_nfl_official_schedule_away_team ON nfl_official_schedule_2025(away_team_id)');
    
    // Get statistics
    const stats = db.prepare('SELECT COUNT(*) as count FROM nfl_official_schedule_2025').get();
    const weekStats = db.prepare(`
      SELECT week, COUNT(*) as game_count 
      FROM nfl_official_schedule_2025 
      GROUP BY week 
      ORDER BY week
    `).all();
    
    const firstGame = db.prepare(`
      SELECT game_date, home_team_name, away_team_name 
      FROM nfl_official_schedule_2025 
      ORDER BY game_date ASC 
      LIMIT 1
    `).get();
    
    const lastGame = db.prepare(`
      SELECT game_date, home_team_name, away_team_name 
      FROM nfl_official_schedule_2025 
      ORDER BY game_date DESC 
      LIMIT 1
    `).get();
    
    console.log('📊 NFL Official Schedule Statistics:');
    console.log(`  Total Games: ${stats.count}`);
    console.log(`  Successfully Imported: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  First Game: ${firstGame ? `${firstGame.away_team_name} @ ${firstGame.home_team_name} (${new Date(firstGame.game_date).toLocaleDateString()})` : 'N/A'}`);
    console.log(`  Last Game: ${lastGame ? `${lastGame.away_team_name} @ ${lastGame.home_team_name} (${new Date(lastGame.game_date).toLocaleDateString()})` : 'N/A'}`);
    
    if (weekStats.length > 0) {
      console.log('📅 Games by Week:');
      weekStats.forEach(week => {
        console.log(`  Week ${week.week}: ${week.game_count} games`);
      });
    }
    
    db.close();
    console.log('✅ NFL official schedule import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing NFL official schedule:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  importNFLOfficialSchedule()
    .then(() => {
      console.log('🎉 NFL official schedule import completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importNFLOfficialSchedule };
