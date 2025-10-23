#!/usr/bin/env node

/**
 * Database Management CLI Tool
 * Provides commands for managing the NFL database
 */

const { getDatabase, getDatabaseStats, clearDatabase, backupDatabase } = require('../lib/database/connection');
const { 
  getAllTeams, 
  getAllPlayers, 
  getCurrentSeasonTopPerformers,
  getUpcomingGames,
  getRecentGames 
} = require('../lib/database/queries');

/**
 * Show database statistics
 */
function showStats() {
  console.log('📊 NFL Database Statistics');
  console.log('========================');
  
  const stats = getDatabaseStats();
  console.log(`Teams: ${stats.teams}`);
  console.log(`Players: ${stats.players}`);
  console.log(`Games: ${stats.games}`);
  console.log(`Player Game Stats: ${stats.playerGameStats}`);
  console.log(`Player Season Stats: ${stats.playerSeasonStats}`);
  console.log(`Injuries: ${stats.injuries}`);
  
  if (stats.teams === 0) {
    console.log('\n⚠️ Database appears to be empty. Run data import first:');
    console.log('  node scripts/download-nflverse-data.js all');
    console.log('  node scripts/import-nflverse-data.js all');
  }
}

/**
 * Show top performers
 */
function showTopPerformers(season = 2024) {
  console.log(`🏆 Top Performers - ${season} Season`);
  console.log('=====================================');
  
  const topPerformers = getCurrentSeasonTopPerformers(season);
  
  console.log('\n🏈 Quarterbacks (Passing Yards):');
  topPerformers.qbs.forEach((qb, index) => {
    console.log(`  ${index + 1}. ${qb.player_name} (${qb.team}) - ${qb.passing_yards} yards`);
  });
  
  console.log('\n🏃 Running Backs (Rushing Yards):');
  topPerformers.rbs.forEach((rb, index) => {
    console.log(`  ${index + 1}. ${rb.player_name} (${rb.team}) - ${rb.rushing_yards} yards`);
  });
  
  console.log('\n🎯 Wide Receivers (Receiving Yards):');
  topPerformers.wrs.forEach((wr, index) => {
    console.log(`  ${index + 1}. ${wr.player_name} (${wr.team}) - ${wr.receiving_yards} yards`);
  });
  
  console.log('\n🤝 Tight Ends (Receiving Yards):');
  topPerformers.tes.forEach((te, index) => {
    console.log(`  ${index + 1}. ${te.player_name} (${te.team}) - ${te.receiving_yards} yards`);
  });
}

/**
 * Show teams
 */
function showTeams() {
  console.log('🏈 NFL Teams');
  console.log('===========');
  
  const teams = getAllTeams();
  
  if (teams.length === 0) {
    console.log('No teams found. Import data first.');
    return;
  }
  
  teams.forEach(team => {
    console.log(`${team.team_abbr} - ${team.team_name} (${team.team_conference} ${team.team_division})`);
  });
}

/**
 * Show upcoming games
 */
function showUpcomingGames(season = 2024) {
  console.log(`📅 Upcoming Games - ${season} Season`);
  console.log('===================================');
  
  const games = getUpcomingGames(season, 10);
  
  if (games.length === 0) {
    console.log('No upcoming games found.');
    return;
  }
  
  games.forEach(game => {
    const date = new Date(game.game_date).toLocaleDateString();
    console.log(`Week ${game.week}: ${game.away_team} @ ${game.home_team} - ${date}`);
  });
}

/**
 * Show recent games
 */
function showRecentGames(season = 2024) {
  console.log(`📅 Recent Games - ${season} Season`);
  console.log('=================================');
  
  const games = getRecentGames(season, 10);
  
  if (games.length === 0) {
    console.log('No recent games found.');
    return;
  }
  
  games.forEach(game => {
    const date = new Date(game.game_date).toLocaleDateString();
    const score = game.home_score !== null && game.away_score !== null 
      ? ` (${game.away_score}-${game.home_score})`
      : '';
    console.log(`Week ${game.week}: ${game.away_team} @ ${game.home_team}${score} - ${date}`);
  });
}

/**
 * Clear database
 */
function clearDb() {
  console.log('🗑️ Clearing database...');
  clearDatabase();
  console.log('✅ Database cleared');
}

/**
 * Backup database
 */
function backupDb() {
  console.log('💾 Creating database backup...');
  try {
    const backupPath = backupDatabase();
    console.log(`✅ Database backed up to: ${backupPath}`);
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log('🏈 NFL Database Manager');
  console.log('======================');
  console.log('');
  console.log('Usage: node scripts/db-manager.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  stats                    Show database statistics');
  console.log('  top [season]            Show top performers (default: 2024)');
  console.log('  teams                   Show all teams');
  console.log('  upcoming [season]       Show upcoming games (default: 2024)');
  console.log('  recent [season]         Show recent games (default: 2024)');
  console.log('  clear                   Clear all data from database');
  console.log('  backup                  Create database backup');
  console.log('  help                    Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/db-manager.js stats');
  console.log('  node scripts/db-manager.js top 2024');
  console.log('  node scripts/db-manager.js upcoming 2025');
  console.log('  node scripts/db-manager.js backup');
  console.log('');
  console.log('Data Management:');
  console.log('  node scripts/download-nflverse-data.js all');
  console.log('  node scripts/import-nflverse-data.js all');
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];
const option = args[1];

switch (command) {
  case 'stats':
    showStats();
    break;
  case 'top':
    showTopPerformers(option ? parseInt(option) : 2024);
    break;
  case 'teams':
    showTeams();
    break;
  case 'upcoming':
    showUpcomingGames(option ? parseInt(option) : 2024);
    break;
  case 'recent':
    showRecentGames(option ? parseInt(option) : 2024);
    break;
  case 'clear':
    clearDb();
    break;
  case 'backup':
    backupDb();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run "node scripts/db-manager.js help" for available commands.');
    } else {
      showHelp();
    }
    break;
}







