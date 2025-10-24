/**
 * Database Connection and Management
 * SQLite database for NFL data from NFLverse
 * Note: This should only be used on the server side
 */

// Only import on server side
let Database: any = null;
if (typeof window === 'undefined') {
  try {
    Database = require('better-sqlite3');
  } catch (error) {
    console.warn('better-sqlite3 not available, using fallback');
  }
}

import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'nfl.db');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'database', 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: any = null;

/**
 * Get database connection
 */
export function getDatabase(): any {
  if (!Database) {
    throw new Error('Database not available - better-sqlite3 is not installed or not running on server side');
  }
  
  if (!db) {
    db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize schema if needed
    initializeSchema();
    
    console.log(`📊 Connected to NFL database: ${DB_PATH}`);
  }
  
  return db;
}

/**
 * Initialize database schema
 */
function initializeSchema(): void {
  try {
    // Skip schema initialization if database already has data
    const tableCheck = db!.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='players'").get();
    if (tableCheck) {
      console.log('📊 Database already exists, skipping schema initialization');
      return;
    }
    
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('CREATE')) {
        try {
          db!.exec(statement);
        } catch (stmtError) {
          // Ignore errors for existing tables
          console.log('⚠️ Skipping existing table creation');
        }
      }
    }
    
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
  }
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('📊 Database connection closed');
  }
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  teams: number;
  players: number;
  games: number;
  playerGameStats: number;
  playerSeasonStats: number;
  injuries: number;
} {
  const database = getDatabase();
  
  try {
    const teams = database.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
    const players = database.prepare('SELECT COUNT(*) as count FROM players').get() as { count: number };
    const games = database.prepare('SELECT COUNT(*) as count FROM games').get() as { count: number };
    const playerGameStats = database.prepare('SELECT COUNT(*) as count FROM player_game_stats').get() as { count: number };
    const playerSeasonStats = database.prepare('SELECT COUNT(*) as count FROM player_season_stats').get() as { count: number };
    const injuries = database.prepare('SELECT COUNT(*) as count FROM injuries').get() as { count: number };
    
    return {
      teams: teams.count,
      players: players.count,
      games: games.count,
      playerGameStats: playerGameStats.count,
      playerSeasonStats: playerSeasonStats.count,
      injuries: injuries.count,
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return {
      teams: 0,
      players: 0,
      games: 0,
      playerGameStats: 0,
      playerSeasonStats: 0,
      injuries: 0,
    };
  }
}

/**
 * Clear all data from database
 */
export function clearDatabase(): void {
  const database = getDatabase();
  
  try {
    // Disable foreign key constraints temporarily
    database.pragma('foreign_keys = OFF');
    
    // Clear tables in reverse dependency order
    database.exec('DELETE FROM injuries');
    database.exec('DELETE FROM player_season_stats');
    database.exec('DELETE FROM player_game_stats');
    database.exec('DELETE FROM games');
    database.exec('DELETE FROM players');
    database.exec('DELETE FROM teams');
    
    // Re-enable foreign key constraints
    database.pragma('foreign_keys = ON');
    
    console.log('🗑️ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

/**
 * Backup database
 */
export function backupDatabase(backupPath?: string): string {
  const database = getDatabase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultBackupPath = path.join(process.cwd(), 'data', `nfl-backup-${timestamp}.db`);
  const finalBackupPath = backupPath || defaultBackupPath;
  
  try {
    database.backup(finalBackupPath);
    console.log(`💾 Database backed up to: ${finalBackupPath}`);
    return finalBackupPath;
  } catch (error) {
    console.error('❌ Error backing up database:', error);
    throw error;
  }
}
