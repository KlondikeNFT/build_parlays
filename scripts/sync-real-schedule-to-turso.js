const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

async function syncRealScheduleToTurso() {
  console.log('🏈 Syncing real NFL 2025 schedule to Turso database...');
  
  try {
    // Check for environment variables
    const tursoUrl = process.env.TURSO_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!tursoUrl || !tursoToken) {
      console.error('❌ Missing TURSO_URL or TURSO_AUTH_TOKEN environment variables');
      console.log('Please set these in your .env.local file:');
      console.log('TURSO_URL=your_turso_url');
      console.log('TURSO_AUTH_TOKEN=your_turso_token');
      return false;
    }
    
    // Read the real schedule data
    const schedulePath = path.join(__dirname, '..', 'data', 'nfl-2025-complete-real-schedule.json');
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    
    console.log(`📊 Found ${scheduleData.length} games to sync to Turso`);
    
    // Create Turso client
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken
    });
    
    console.log('📊 Connected to Turso database');
    
    // Create the real schedule table in Turso
    console.log('📝 Creating real_schedule_2025 table in Turso...');
    await client.execute('DROP TABLE IF EXISTS real_schedule_2025');
    await client.execute(`
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
      )
    `);
    
    // Create indexes
    console.log('📝 Creating indexes...');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_real_schedule_date ON real_schedule_2025(game_date)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_real_schedule_week ON real_schedule_2025(week)');
    
    // Insert games in batches
    console.log('📝 Inserting games into Turso...');
    let successCount = 0;
    const batchSize = 50;
    
    for (let i = 0; i < scheduleData.length; i += batchSize) {
      const batch = scheduleData.slice(i, i + batchSize);
      
      try {
        // Insert each game individually
        for (const game of batch) {
          await client.execute(`
            INSERT OR REPLACE INTO real_schedule_2025 (
              game_id, season, week, game_date, game_time,
              home_team_name, away_team_name, home_team_abbr, away_team_abbr,
              broadcast_primary, game_type, venue_name, venue_city, venue_state,
              status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
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
          ]);
        }
        
        successCount += batch.length;
        console.log(`✅ Synced batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(scheduleData.length / batchSize)} (${batch.length} games)`);
        
      } catch (error) {
        console.error(`❌ Error syncing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        // Continue with next batch
      }
    }
    
    console.log(`✅ Successfully synced ${successCount} games to Turso`);
    
    // Verify data
    const countResult = await client.execute('SELECT COUNT(*) as count FROM real_schedule_2025');
    const count = countResult.rows[0].count;
    console.log(`📊 Total games in Turso: ${count}`);
    
    // Show sample for October 23rd
    const oct23Result = await client.execute('SELECT * FROM real_schedule_2025 WHERE game_date = ?', ['2025-10-23']);
    console.log(`📅 Games for October 23rd, 2025: ${oct23Result.rows.length}`);
    oct23Result.rows.forEach(game => {
      console.log(`  - ${game.away_team_name} @ ${game.home_team_name} (${game.game_time}) - ${game.broadcast_primary}`);
    });
    
    console.log('✅ Real schedule sync to Turso completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error syncing real schedule to Turso:', error);
    return false;
  }
}

if (require.main === module) {
  syncRealScheduleToTurso()
    .then(success => {
      if (success) {
        console.log('🎉 Real NFL schedule successfully synced to Turso!');
      } else {
        console.log('❌ Failed to sync real NFL schedule to Turso');
      }
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
    });
}

module.exports = { syncRealScheduleToTurso };
