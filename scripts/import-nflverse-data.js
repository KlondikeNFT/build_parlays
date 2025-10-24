#!/usr/bin/env node

/**
 * NFLverse Data Import Script
 * Imports downloaded CSV data into SQLite database
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { getDatabase, clearDatabase, backupDatabase } = require('../lib/database/connection');

const DATA_DIR = path.join(process.cwd(), 'data', 'nflverse');

/**
 * Parse CSV file and return array of objects
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Import teams data
 */
async function importTeams() {
  const filePath = path.join(DATA_DIR, 'teams.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Teams CSV not found, skipping...');
    return;
  }
  
  console.log('📊 Importing teams...');
  const teams = await parseCSV(filePath);
  const db = getDatabase();
  
  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO teams (
      team_id, team_name, team_abbr, team_conference, team_division,
      team_color_primary, team_color_secondary, team_logo_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let imported = 0;
  for (const team of teams) {
    try {
      insertTeam.run(
        team.team_id || team.team_abbr,
        team.team_name,
        team.team_abbr,
        team.team_conference,
        team.team_division,
        team.team_color_primary,
        team.team_color_secondary,
        team.team_logo_url
      );
      imported++;
    } catch (error) {
      console.error(`❌ Error importing team ${team.team_name}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${imported} teams`);
}

/**
 * Import players data
 */
async function importPlayers() {
  const filePath = path.join(DATA_DIR, 'players.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Players CSV not found, skipping...');
    return;
  }
  
  console.log('👥 Importing players...');
  const players = await parseCSV(filePath);
  const db = getDatabase();
  
  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players (
      player_id, player_name, player_display_name, first_name, last_name,
      position, team, jersey_number, height, weight, birth_date, college,
      experience, headshot_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let imported = 0;
  for (const player of players) {
    try {
      insertPlayer.run(
        player.player_id,
        player.player_name || `${player.first_name} ${player.last_name}`,
        player.player_display_name,
        player.first_name,
        player.last_name,
        player.position,
        player.team,
        player.jersey_number ? parseInt(player.jersey_number) : null,
        player.height,
        player.weight ? parseInt(player.weight) : null,
        player.birth_date,
        player.college,
        player.experience ? parseInt(player.experience) : null,
        player.headshot_url,
        player.status || 'Active'
      );
      imported++;
    } catch (error) {
      console.error(`❌ Error importing player ${player.player_name}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${imported} players`);
}

/**
 * Import games data
 */
async function importGames() {
  const filePath = path.join(DATA_DIR, 'games.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Games CSV not found, skipping...');
    return;
  }
  
  console.log('🏈 Importing games...');
  const games = await parseCSV(filePath);
  const db = getDatabase();
  
  const insertGame = db.prepare(`
    INSERT OR REPLACE INTO games (
      game_id, season, week, game_type, game_date, home_team, away_team,
      home_score, away_score, game_status, weather
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let imported = 0;
  for (const game of games) {
    try {
      insertGame.run(
        game.game_id,
        game.season ? parseInt(game.season) : null,
        game.week ? parseInt(game.week) : null,
        game.game_type || 'REG',
        game.game_date,
        game.home_team,
        game.away_team,
        game.home_score ? parseInt(game.home_score) : null,
        game.away_score ? parseInt(game.away_score) : null,
        game.game_status || 'scheduled',
        game.weather
      );
      imported++;
    } catch (error) {
      console.error(`❌ Error importing game ${game.game_id}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${imported} games`);
}

/**
 * Import player game stats
 */
async function importPlayerGameStats() {
  const filePath = path.join(DATA_DIR, 'playerGameStats.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ Player game stats CSV not found, skipping...');
    return;
  }
  
  console.log('📊 Importing player game stats...');
  const stats = await parseCSV(filePath);
  const db = getDatabase();
  
  const insertStats = db.prepare(`
    INSERT OR REPLACE INTO player_game_stats (
      player_id, game_id, season, week, team, opponent, home_away, played, started,
      passing_attempts, passing_completions, passing_yards, passing_touchdowns, passing_interceptions, passing_rating,
      rushing_attempts, rushing_yards, rushing_touchdowns,
      targets, receptions, receiving_yards, receiving_touchdowns,
      fantasy_points, fantasy_points_ppr
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let imported = 0;
  for (const stat of stats) {
    try {
      insertStats.run(
        stat.player_id ? parseInt(stat.player_id) : null,
        stat.game_id,
        stat.season ? parseInt(stat.season) : null,
        stat.week ? parseInt(stat.week) : null,
        stat.team,
        stat.opponent,
        stat.home_away,
        stat.played ? parseInt(stat.played) : 0,
        stat.started ? parseInt(stat.started) : 0,
        stat.passing_attempts ? parseInt(stat.passing_attempts) : 0,
        stat.passing_completions ? parseInt(stat.passing_completions) : 0,
        stat.passing_yards ? parseInt(stat.passing_yards) : 0,
        stat.passing_touchdowns ? parseInt(stat.passing_touchdowns) : 0,
        stat.passing_interceptions ? parseInt(stat.passing_interceptions) : 0,
        stat.passing_rating ? parseFloat(stat.passing_rating) : 0,
        stat.rushing_attempts ? parseInt(stat.rushing_attempts) : 0,
        stat.rushing_yards ? parseInt(stat.rushing_yards) : 0,
        stat.rushing_touchdowns ? parseInt(stat.rushing_touchdowns) : 0,
        stat.targets ? parseInt(stat.targets) : 0,
        stat.receptions ? parseInt(stat.receptions) : 0,
        stat.receiving_yards ? parseInt(stat.receiving_yards) : 0,
        stat.receiving_touchdowns ? parseInt(stat.receiving_touchdowns) : 0,
        stat.fantasy_points ? parseFloat(stat.fantasy_points) : 0,
        stat.fantasy_points_ppr ? parseFloat(stat.fantasy_points_ppr) : 0
      );
      imported++;
    } catch (error) {
      console.error(`❌ Error importing player game stats for player ${stat.player_id}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${imported} player game stats`);
}

/**
 * Import all data
 */
async function importAllData() {
  console.log('🏈 Starting NFLverse data import...');
  
  try {
    // Create backup before importing
    console.log('💾 Creating database backup...');
    backupDatabase();
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    clearDatabase();
    
    // Import data in order
    await importTeams();
    await importPlayers();
    await importGames();
    await importPlayerGameStats();
    
    console.log('\n🎉 Data import complete!');
    
    // Show database stats
    const { getDatabaseStats } = require('../lib/database/connection');
    const stats = getDatabaseStats();
    console.log('\n📊 Database Statistics:');
    console.log(`  Teams: ${stats.teams}`);
    console.log(`  Players: ${stats.players}`);
    console.log(`  Games: ${stats.games}`);
    console.log(`  Player Game Stats: ${stats.playerGameStats}`);
    console.log(`  Player Season Stats: ${stats.playerSeasonStats}`);
    console.log(`  Injuries: ${stats.injuries}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  importAllData();
} else {
  console.log('🏈 NFLverse Data Importer');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/import-nflverse-data.js all  # Import all data');
  console.log('');
  console.log('Make sure you have downloaded the data first:');
  console.log('  node scripts/download-nflverse-data.js all');
}









