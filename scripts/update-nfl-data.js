#!/usr/bin/env node

/**
 * NFL Data Update Workflow
 * Complete workflow for updating NFL data from NFLverse
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Run a command and return the output
 */
function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

/**
 * Check if data directory exists
 */
function checkDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('📁 Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Check if database exists
 */
function checkDatabase() {
  const dbPath = path.join(process.cwd(), 'data', 'nfl.db');
  return fs.existsSync(dbPath);
}

/**
 * Create backup if database exists
 */
function createBackup() {
  if (checkDatabase()) {
    console.log('💾 Creating database backup...');
    runCommand('node scripts/db-manager.js backup', 'Database backup');
  }
}

/**
 * Download latest data
 */
function downloadData() {
  console.log('📥 Downloading latest NFLverse data...');
  runCommand('node scripts/download-nflverse-data.js all', 'Data download');
}

/**
 * Import data into database
 */
function importData() {
  console.log('📊 Importing data into database...');
  runCommand('node scripts/import-nflverse-data.js all', 'Data import');
}

/**
 * Verify import
 */
function verifyImport() {
  console.log('🔍 Verifying data import...');
  const output = runCommand('node scripts/db-manager.js stats', 'Database verification');
  
  // Check if we have data
  if (output.includes('Teams: 0')) {
    throw new Error('Import verification failed - no teams found');
  }
  
  console.log('✅ Data import verified successfully');
}

/**
 * Show summary
 */
function showSummary() {
  console.log('\n📊 Final Database Statistics:');
  runCommand('node scripts/db-manager.js stats', 'Final statistics');
  
  console.log('\n🏆 Top Performers:');
  runCommand('node scripts/db-manager.js top 2024', 'Top performers');
}

/**
 * Main update workflow
 */
async function updateNFLData() {
  console.log('🏈 NFL Data Update Workflow');
  console.log('==========================');
  console.log('This will download and import the latest NFL data from NFLverse');
  console.log('');
  
  try {
    // Step 1: Check prerequisites
    checkDataDirectory();
    
    // Step 2: Create backup if needed
    createBackup();
    
    // Step 3: Download latest data
    downloadData();
    
    // Step 4: Import data
    importData();
    
    // Step 5: Verify import
    verifyImport();
    
    // Step 6: Show summary
    showSummary();
    
    console.log('\n🎉 NFL data update completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Visit your site to see the updated data');
    console.log('3. Check the database manager: node scripts/db-manager.js help');
    
  } catch (error) {
    console.error('\n❌ Update workflow failed:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify NFLverse data is available');
    console.log('3. Check database permissions');
    console.log('4. Try running individual commands manually');
    process.exit(1);
  }
}

/**
 * Update specific season
 */
async function updateSeason(season) {
  console.log(`🏈 NFL Data Update - ${season} Season`);
  console.log('=====================================');
  
  try {
    checkDataDirectory();
    createBackup();
    
    console.log(`📥 Downloading ${season} season data...`);
    runCommand(`node scripts/download-nflverse-data.js season ${season}`, `${season} season download`);
    
    console.log('📊 Importing season data...');
    runCommand('node scripts/import-nflverse-data.js all', 'Season data import');
    
    verifyImport();
    showSummary();
    
    console.log(`\n🎉 ${season} season data update completed!`);
    
  } catch (error) {
    console.error(`\n❌ ${season} season update failed:`, error.message);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  updateNFLData();
} else if (command === 'season' && args[1]) {
  updateSeason(args[1]);
} else {
  console.log('🏈 NFL Data Update Workflow');
  console.log('==========================');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/update-nfl-data.js all          # Update all data');
  console.log('  node scripts/update-nfl-data.js season 2024  # Update specific season');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/update-nfl-data.js all');
  console.log('  node scripts/update-nfl-data.js season 2024');
  console.log('  node scripts/update-nfl-data.js season 2025');
  console.log('');
  console.log('This workflow will:');
  console.log('1. Create a backup of your current database');
  console.log('2. Download the latest data from NFLverse');
  console.log('3. Import the data into your local database');
  console.log('4. Verify the import was successful');
  console.log('5. Show a summary of the updated data');
}







