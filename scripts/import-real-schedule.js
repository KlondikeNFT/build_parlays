const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function importRealSchedule() {
  console.log('🏈 Importing real NFL 2025 schedule to local database...');
  
  try {
    // Read the parsed schedule data
    const schedulePath = path.join(__dirname, '..', 'data', 'nfl-2025-complete-real-schedule.json');
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    
    console.log(`📊 Found ${scheduleData.length} games to import`);
    
    // Connect to local SQLite database
    const dbPath = path.join(__dirname, '..', 'data', 'nfl.db');
    const db = new Database(dbPath);
    
    console.log('📊 Connected to local SQLite database');
    
    // Create the real schedule table
    console.log('📝 Creating real_schedule_2025 table...');
    db.exec(`
      DROP TABLE IF EXISTS real_schedule_2025;
      CREATE TABLE real_schedule_2025 (
        game_id TEXT PRIMARY KEY,
        season INTEGER,
        week INTEGER,
        game_date TEXT,
        game_time TEXT,
        home_team_name TEXT,
        away_team_name TEXT,
        home_team_abbr TEXT,
        away_team_abbr TEXT,
        broadcast_primary TEXT,
        game_type TEXT,
        venue_name TEXT,
        venue_city TEXT,
        venue_state TEXT,
        status TEXT,
        created_at TEXT
      );
    `);
    
    // Insert games
    console.log('📝 Inserting games...');
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO real_schedule_2025 (
        game_id, season, week, game_date, game_time,
        home_team_name, away_team_name, home_team_abbr, away_team_abbr,
        broadcast_primary, game_type, venue_name, venue_city, venue_state,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let successCount = 0;
    for (const game of scheduleData) {
      try {
        insertStmt.run(
          game.game_id || null,
          game.season || null,
          game.week || null,
          game.game_date || null,
          game.game_time || null,
          game.home_team_name || null,
          game.away_team_name || null,
          game.home_team_abbr || null,
          game.away_team_abbr || null,
          game.broadcast_primary || null,
          game.game_type || null,
          game.venue_name || null,
          game.venue_city || null,
          game.venue_state || null,
          game.status || null,
          game.created_at || new Date().toISOString()
        );
        successCount++;
      } catch (error) {
        console.error(`❌ Error inserting game ${game.game_id}:`, error.message);
      }
    }
    
    console.log(`✅ Successfully imported ${successCount} games`);
    
    // Create index
    console.log('📝 Creating index...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_real_schedule_date ON real_schedule_2025(game_date)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_real_schedule_week ON real_schedule_2025(week)');
    
    // Verify data
    const count = db.prepare('SELECT COUNT(*) as count FROM real_schedule_2025').get();
    console.log(`📊 Total games in database: ${count.count}`);
    
    // Show sample for October 23rd
    const oct23Games = db.prepare('SELECT * FROM real_schedule_2025 WHERE game_date = ?').all('2025-10-23');
    console.log(`📅 Games for October 23rd, 2025: ${oct23Games.length}`);
    oct23Games.forEach(game => {
      console.log(`  - ${game.away_team_name} @ ${game.home_team_name} (${game.game_time}) - ${game.broadcast_primary}`);
    });
    
    db.close();
    console.log('✅ Real schedule import completed successfully!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error importing real schedule:', error);
    return false;
  }
}

if (require.main === module) {
  importRealSchedule();
}

module.exports = { importRealSchedule };
