const { parseNFLSchedule } = require('./parse-nfl-schedule');
const { importNFLOfficialSchedule } = require('./import-nfl-official-schedule');
const { syncNFLOfficialScheduleToTurso } = require('./sync-nfl-official-schedule-to-turso');

async function setupNFLOfficialSchedule() {
  try {
    console.log('🏈 Setting up official NFL 2025 schedule from operations.nfl.com...');
    console.log('=====================================\n');
    
    // Step 1: Parse NFL schedule from the official website
    console.log('📡 Step 1: Parsing official NFL 2025 schedule...');
    const games = await parseNFLSchedule();
    console.log(`✅ Successfully parsed ${games.length} games from NFL Operations\n`);
    
    // Step 2: Import to local SQLite database
    console.log('🗄️ Step 2: Importing to local SQLite database...');
    await importNFLOfficialSchedule();
    console.log('✅ Successfully imported to local SQLite database\n');
    
    // Step 3: Sync to Turso database
    console.log('☁️ Step 3: Syncing to Turso database...');
    await syncNFLOfficialScheduleToTurso();
    console.log('✅ Successfully synced to Turso database\n');
    
    console.log('🎉 Official NFL 2025 schedule setup completed successfully!');
    console.log('=====================================');
    console.log('✅ Official NFL 2025 schedule is now available in both local and Turso databases');
    console.log('✅ Your UpcomingGames component will now work with real upcoming games');
    console.log('✅ All data is sourced from the official NFL Operations website');
    console.log('✅ No more mock data - everything is real and official!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  setupNFLOfficialSchedule()
    .then(() => {
      console.log('🎉 Official NFL schedule setup completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupNFLOfficialSchedule };
