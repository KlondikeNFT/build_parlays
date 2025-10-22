#!/usr/bin/env node

/**
 * Simple NFLverse Data Import Script
 * Imports downloaded CSV data into SQLite database
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(process.cwd(), 'data', 'nflverse');
const DB_PATH = path.join(process.cwd(), 'data', 'nfl.db');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Create database connection
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('📊 Connected to NFL database:', DB_PATH);

// Create tables
function createTables() {
  console.log('🏗️ Creating database tables...');
  
  // Teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      team_id TEXT PRIMARY KEY,
      team_abbr TEXT NOT NULL UNIQUE,
      team_name TEXT NOT NULL,
      team_conference TEXT,
      team_division TEXT,
      team_color_primary TEXT,
      team_color_secondary TEXT,
      team_logo_url TEXT
    )
  `);

  // Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      player_id TEXT PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      position TEXT,
      team TEXT,
      jersey_number INTEGER,
      height TEXT,
      weight INTEGER,
      birth_date TEXT,
      college TEXT,
      experience INTEGER,
      headshot_url TEXT,
      status TEXT,
      FOREIGN KEY (team) REFERENCES teams(team_abbr)
    )
  `);

  // Player season stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_season_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT,
      season INTEGER,
      team TEXT,
      games_played INTEGER,
      games_started INTEGER,
      passing_yards INTEGER DEFAULT 0,
      passing_touchdowns INTEGER DEFAULT 0,
      passing_interceptions INTEGER DEFAULT 0,
      passing_completions INTEGER DEFAULT 0,
      passing_attempts INTEGER DEFAULT 0,
      rushing_yards INTEGER DEFAULT 0,
      rushing_touchdowns INTEGER DEFAULT 0,
      rushing_attempts INTEGER DEFAULT 0,
      receiving_yards INTEGER DEFAULT 0,
      receiving_touchdowns INTEGER DEFAULT 0,
      receptions INTEGER DEFAULT 0,
      receiving_targets INTEGER DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(player_id)
    )
  `);

  // Player game stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_game_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT,
      season INTEGER,
      week INTEGER,
      team TEXT,
      opponent TEXT,
      home_away TEXT,
      played INTEGER DEFAULT 0,
      passing_yards INTEGER DEFAULT 0,
      passing_touchdowns INTEGER DEFAULT 0,
      passing_interceptions INTEGER DEFAULT 0,
      passing_completions INTEGER DEFAULT 0,
      passing_attempts INTEGER DEFAULT 0,
      rushing_yards INTEGER DEFAULT 0,
      rushing_touchdowns INTEGER DEFAULT 0,
      rushing_attempts INTEGER DEFAULT 0,
      receiving_yards INTEGER DEFAULT 0,
      receiving_touchdowns INTEGER DEFAULT 0,
      receptions INTEGER DEFAULT 0,
      receiving_targets INTEGER DEFAULT 0,
      FOREIGN KEY (player_id) REFERENCES players(player_id)
    )
  `);

  console.log('✅ Database tables created');
}

// Parse CSV file
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

// Import players data
async function importPlayers() {
  const filePath = path.join(DATA_DIR, 'players.csv');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ players.csv not found, skipping...');
    return;
  }

  console.log('📥 Importing players data...');
  const players = await parseCSV(filePath);
  
  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players (
      player_id, first_name, last_name, position, team, jersey_number,
      height, weight, birth_date, college, experience, headshot_url, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const player of players) {
    try {
      insertPlayer.run(
        player.player_id || player.gsis_id,
        player.first_name,
        player.last_name,
        player.position,
        player.team,
        player.jersey_number ? parseInt(player.jersey_number) : null,
        player.height,
        player.weight ? parseInt(player.weight) : null,
        player.birth_date,
        player.college,
        player.years_exp ? parseInt(player.years_exp) : null,
        player.headshot_url,
        player.status || 'Active'
      );
      count++;
    } catch (error) {
      console.warn(`⚠️ Error importing player ${player.player_id}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${count} players`);
}

// Import player season stats
async function importPlayerSeasonStats() {
  const filePath = path.join(DATA_DIR, 'playerSeasonStats.csv');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ playerSeasonStats.csv not found, skipping...');
    return;
  }

  console.log('📥 Importing player season stats...');
  const stats = await parseCSV(filePath);
  
  const insertStats = db.prepare(`
    INSERT OR REPLACE INTO player_season_stats (
      player_id, season, team, games_played, games_started,
      passing_yards, passing_touchdowns, passing_interceptions,
      passing_completions, passing_attempts, rushing_yards,
      rushing_touchdowns, rushing_attempts, receiving_yards,
      receiving_touchdowns, receptions, receiving_targets
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const stat of stats) {
    try {
      insertStats.run(
        stat.player_id || stat.gsis_id,
        stat.season ? parseInt(stat.season) : 2024,
        stat.team,
        stat.games ? parseInt(stat.games) : 0,
        stat.games_started ? parseInt(stat.games_started) : 0,
        stat.passing_yards ? parseInt(stat.passing_yards) : 0,
        stat.passing_tds ? parseInt(stat.passing_tds) : 0,
        stat.passing_int ? parseInt(stat.passing_int) : 0,
        stat.passing_cmp ? parseInt(stat.passing_cmp) : 0,
        stat.passing_att ? parseInt(stat.passing_att) : 0,
        stat.rushing_yards ? parseInt(stat.rushing_yards) : 0,
        stat.rushing_tds ? parseInt(stat.rushing_tds) : 0,
        stat.rushing_att ? parseInt(stat.rushing_att) : 0,
        stat.receiving_yards ? parseInt(stat.receiving_yards) : 0,
        stat.receiving_tds ? parseInt(stat.receiving_tds) : 0,
        stat.receiving_rec ? parseInt(stat.receiving_rec) : 0,
        stat.receiving_tar ? parseInt(stat.receiving_tar) : 0
      );
      count++;
    } catch (error) {
      console.warn(`⚠️ Error importing season stats for ${stat.player_id}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${count} season stats records`);
}

// Import player game stats
async function importPlayerGameStats() {
  const filePath = path.join(DATA_DIR, 'playerGameStats.csv');
  if (!fs.existsSync(filePath)) {
    console.log('⚠️ playerGameStats.csv not found, skipping...');
    return;
  }

  console.log('📥 Importing player game stats...');
  const stats = await parseCSV(filePath);
  
  const insertStats = db.prepare(`
    INSERT OR REPLACE INTO player_game_stats (
      player_id, season, week, team, opponent, home_away, played,
      passing_yards, passing_touchdowns, passing_interceptions,
      passing_completions, passing_attempts, rushing_yards,
      rushing_touchdowns, rushing_attempts, receiving_yards,
      receiving_touchdowns, receptions, receiving_targets
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const stat of stats) {
    try {
      insertStats.run(
        stat.player_id || stat.gsis_id,
        stat.season ? parseInt(stat.season) : 2024,
        stat.week ? parseInt(stat.week) : 1,
        stat.team,
        stat.opponent,
        stat.home_away,
        stat.played ? parseInt(stat.played) : 0,
        stat.passing_yards ? parseInt(stat.passing_yards) : 0,
        stat.passing_tds ? parseInt(stat.passing_tds) : 0,
        stat.passing_int ? parseInt(stat.passing_int) : 0,
        stat.passing_cmp ? parseInt(stat.passing_cmp) : 0,
        stat.passing_att ? parseInt(stat.passing_att) : 0,
        stat.rushing_yards ? parseInt(stat.rushing_yards) : 0,
        stat.rushing_tds ? parseInt(stat.rushing_tds) : 0,
        stat.rushing_att ? parseInt(stat.rushing_att) : 0,
        stat.receiving_yards ? parseInt(stat.receiving_yards) : 0,
        stat.receiving_tds ? parseInt(stat.receiving_tds) : 0,
        stat.receiving_rec ? parseInt(stat.receiving_rec) : 0,
        stat.receiving_tar ? parseInt(stat.receiving_tar) : 0
      );
      count++;
    } catch (error) {
      console.warn(`⚠️ Error importing game stats for ${stat.player_id}:`, error.message);
    }
  }
  
  console.log(`✅ Imported ${count} game stats records`);
}

// Add some basic team data
function addBasicTeams() {
  console.log('📥 Adding basic team data...');
  
  const teams = [
    { id: 'KC', abbr: 'KC', name: 'Kansas City Chiefs', conference: 'AFC', division: 'West', primary: '#E31837', secondary: '#FFB81C' },
    { id: 'BUF', abbr: 'BUF', name: 'Buffalo Bills', conference: 'AFC', division: 'East', primary: '#00338D', secondary: '#C60C30' },
    { id: 'DAL', abbr: 'DAL', name: 'Dallas Cowboys', conference: 'NFC', division: 'East', primary: '#003594', secondary: '#869397' },
    { id: 'SF', abbr: 'SF', name: 'San Francisco 49ers', conference: 'NFC', division: 'West', primary: '#AA0000', secondary: '#B3995D' },
    { id: 'BAL', abbr: 'BAL', name: 'Baltimore Ravens', conference: 'AFC', division: 'North', primary: '#241773', secondary: '#000000' },
    { id: 'DET', abbr: 'DET', name: 'Detroit Lions', conference: 'NFC', division: 'North', primary: '#0076B6', secondary: '#B0B7BC' },
    { id: 'MIA', abbr: 'MIA', name: 'Miami Dolphins', conference: 'AFC', division: 'East', primary: '#008E97', secondary: '#FC4C02' },
    { id: 'GB', abbr: 'GB', name: 'Green Bay Packers', conference: 'NFC', division: 'North', primary: '#203731', secondary: '#FFB612' },
    { id: 'TB', abbr: 'TB', name: 'Tampa Bay Buccaneers', conference: 'NFC', division: 'South', primary: '#D50A0A', secondary: '#FF7900' },
    { id: 'HOU', abbr: 'HOU', name: 'Houston Texans', conference: 'AFC', division: 'South', primary: '#03202F', secondary: '#A71930' }
  ];

  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO teams (team_id, team_abbr, team_name, team_conference, team_division, team_color_primary, team_color_secondary)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const team of teams) {
    insertTeam.run(team.id, team.abbr, team.name, team.conference, team.division, team.primary, team.secondary);
  }
  
  console.log(`✅ Added ${teams.length} teams`);
}

// Main import function
async function runImport() {
  try {
    console.log('🏈 Starting NFLverse data import...');
    
    // Create tables
    createTables();
    
    // Add basic team data
    addBasicTeams();
    
    // Import data
    await importPlayers();
    await importPlayerSeasonStats();
    await importPlayerGameStats();
    
    console.log('🎉 Import complete!');
    
    // Show stats
    const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get();
    const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get();
    const seasonStatsCount = db.prepare('SELECT COUNT(*) as count FROM player_season_stats').get();
    const gameStatsCount = db.prepare('SELECT COUNT(*) as count FROM player_game_stats').get();
    
    console.log('\n📊 Database Statistics:');
    console.log(`  Players: ${playerCount.count}`);
    console.log(`  Teams: ${teamCount.count}`);
    console.log(`  Season Stats: ${seasonStatsCount.count}`);
    console.log(`  Game Stats: ${gameStatsCount.count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run import
runImport();


