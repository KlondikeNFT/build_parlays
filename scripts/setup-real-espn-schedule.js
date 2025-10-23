const { fetchRealESPNSchedule } = require('./fetch-real-espn-schedule');
const { importESPNchedule } = require('./import-espn-schedule');
const { syncESPNcheduleToTurso } = require('./sync-espn-schedule-to-turso');

async function setupRealESPNSchedule() {
  try {
    console.log('🏈 Setting up real NFL 2025 schedule from ESPN...');
    console.log('=====================================\n');
    
    // Step 1: Fetch real schedule from ESPN
    console.log('📡 Step 1: Fetching real NFL 2025 schedule from ESPN...');
    const games = await fetchRealESPNSchedule();
    console.log(`✅ Successfully fetched ${games.length} games from ESPN\n`);
    
    // Step 2: Import to local SQLite database
    console.log('🗄️ Step 2: Importing to local SQLite database...');
    await importESPNchedule();
    console.log('✅ Successfully imported to local SQLite database\n');
    
    // Step 3: Sync to Turso database
    console.log('☁️ Step 3: Syncing to Turso database...');
    await syncESPNcheduleToTurso();
    console.log('✅ Successfully synced to Turso database\n');
    
    console.log('🎉 Real ESPN NFL 2025 schedule setup completed successfully!');
    console.log('=====================================');
    console.log('✅ Real NFL 2025 schedule is now available in both local and Turso databases');
    console.log('✅ Your UpcomingGames component will now work with real upcoming games');
    console.log('✅ No more mock data - everything is real!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  setupRealESPNSchedule()
    .then(() => {
      console.log('🎉 Real ESPN schedule setup completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupRealESPNSchedule };




