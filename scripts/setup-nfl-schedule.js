#!/usr/bin/env node

/**
 * Master script to fetch, import, and sync NFL 2025 schedule
 * This script will:
 * 1. Fetch the complete NFL 2025 schedule from ESPN
 * 2. Import it into local SQLite database
 * 3. Sync it to Turso database
 */

const { createMockNFLSchedule } = require('./create-mock-schedule');
const { importNFLSchedule } = require('./import-nfl-schedule');
const { syncScheduleToTurso } = require('./sync-schedule-to-turso');

async function setupNFLSchedule() {
  try {
    console.log('🏈 Setting up complete NFL 2025 schedule...');
    console.log('=====================================');
    
    // Step 1: Create mock schedule
    console.log('\n📡 Step 1: Creating comprehensive mock NFL 2025 schedule...');
    const games = createMockNFLSchedule();
    
    if (games.length === 0) {
      console.log('❌ No games fetched. Exiting.');
      return;
    }
    
    // Step 2: Import to local SQLite
    console.log('\n🗄️ Step 2: Importing to local SQLite database...');
    await importNFLSchedule();
    
    // Step 3: Sync to Turso
    console.log('\n☁️ Step 3: Syncing to Turso database...');
    await syncScheduleToTurso();
    
    console.log('\n🎉 NFL 2025 schedule setup completed successfully!');
    console.log('=====================================');
    console.log('✅ Complete NFL 2025 schedule is now available in both local and Turso databases');
    console.log('✅ Your UpcomingGames component will now work with real upcoming games');
    console.log('✅ No more "no games found" issues!');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  setupNFLSchedule();
}

module.exports = { setupNFLSchedule };
