const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

async function syncESPNcheduleToTurso() {
  try {
    console.log('🔄 Syncing ESPN NFL 2025 schedule to Turso database...');
    
    // Check environment variables
    const tursoUrl = process.env.TURSO_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!tursoUrl || !tursoToken) {
      throw new Error('❌ Missing TURSO_URL or TURSO_AUTH_TOKEN environment variables');
    }
    
    // Check if the ESPN schedule file exists
    const schedulePath = path.join(__dirname, '..', 'data', 'espn-2025-schedule.json');
    if (!fs.existsSync(schedulePath)) {
      throw new Error('ESPN schedule file not found. Please run fetch-real-espn-schedule.js and import-espn-schedule.js first.');
    }
    
    // Read the schedule data
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    console.log(`📊 Found ${scheduleData.length} games to sync`);
    
    // Connect to Turso
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken
    });
    
    // Create the ESPN schedule table in Turso
    console.log('🗄️ Creating espn_schedule_2025 table in Turso...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS espn_schedule_2025 (
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
    await client.execute('DELETE FROM espn_schedule_2025');
    
    // Insert games in batches
    console.log('📝 Inserting games into Turso...');
    let successCount = 0;
    let errorCount = 0;
    
    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < scheduleData.length; i += batchSize) {
      const batch = scheduleData.slice(i, i + batchSize);
      
      try {
        // Prepare batch insert
        const values = batch.map(game => [
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
          game.venue_indoor || null,
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
        ]);
        
        // Insert batch
        await client.batch([
          {
            sql: `
              INSERT OR REPLACE INTO espn_schedule_2025 (
                game_id, season, week, game_date, game_time,
                home_team_id, home_team_name, home_team_abbr, home_score,
                away_team_id, away_team_name, away_team_abbr, away_score,
                venue_name, venue_city, venue_state, venue_capacity, venue_indoor,
                broadcast_primary, broadcast_all, broadcast_networks,
                status, game_type,
                weather_temperature, weather_condition, weather_humidity, weather_wind_speed, weather_wind_direction,
                created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: values
          }
        ]);
        
        successCount += batch.length;
        console.log(`✅ Synced batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(scheduleData.length / batchSize)} (${batch.length} games)`);
        
      } catch (error) {
        console.error(`❌ Error syncing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      }
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating indexes in Turso...');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_espn_schedule_date ON espn_schedule_2025(game_date)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_espn_schedule_week ON espn_schedule_2025(week)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_espn_schedule_home_team ON espn_schedule_2025(home_team_id)');
    await client.execute('CREATE INDEX IF NOT EXISTS idx_espn_schedule_away_team ON espn_schedule_2025(away_team_id)');
    
    // Verify the data
    console.log('🔍 Verifying data in Turso...');
    const stats = await client.execute('SELECT COUNT(*) as count FROM espn_schedule_2025');
    const weekStats = await client.execute(`
      SELECT week, COUNT(*) as game_count 
      FROM espn_schedule_2025 
      GROUP BY week 
      ORDER BY week
    `);
    
    const sampleGames = await client.execute(`
      SELECT game_date, home_team_name, away_team_name 
      FROM espn_schedule_2025 
      ORDER BY game_date ASC 
      LIMIT 3
    `);
    
    console.log('📊 Turso Database Statistics:');
    console.log(`  Total Games: ${stats.rows[0].count}`);
    console.log(`  Successfully Synced: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    
    if (weekStats.rows.length > 0) {
      console.log('📅 Games by Week:');
      weekStats.rows.forEach(week => {
        console.log(`  Week ${week.week}: ${week.game_count} games`);
      });
    }
    
    if (sampleGames.rows.length > 0) {
      console.log('📅 Sample Games:');
      sampleGames.rows.forEach(game => {
        console.log(`  - ${game.away_team_name} @ ${game.home_team_name} (${new Date(game.game_date).toLocaleDateString()})`);
      });
    }
    
    console.log('✅ ESPN schedule sync to Turso completed successfully!');
    
  } catch (error) {
    console.error('❌ Error syncing ESPN schedule to Turso:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  syncESPNcheduleToTurso()
    .then(() => {
      console.log('🎉 ESPN schedule sync to Turso completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncESPNcheduleToTurso };




