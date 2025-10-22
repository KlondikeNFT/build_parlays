/**
 * Turso Database Connection
 * Replaces SQLite for Vercel deployment
 */

import { createClient } from '@libsql/client';

// Environment variables for Turso
const TURSO_URL = process.env.TURSO_URL || 'libsql://nfs-data-klondikenft.aws-us-east-1.turso.io';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjEwODQzMDYsImlkIjoiN2Y4MjE4N2QtZDAyZC00MGMxLWJiNmItYWEzMjcxNjVhMTA4IiwicmlkIjoiYWIyMjBkNmItMzVmYi00MWFmLWIyZTAtNDU0YzRiNTkzNmE4In0.oXkUV5lsIoHNd1lHEbauCuSCqRVF9RMXcYHP8Bcatw38UI7nT014Whoe1cXI3uY_cvD1PSW2UNBEFkmvBUj4CQ';

if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
  console.warn('⚠️  Turso credentials not found. Using fallback mode.');
}

let tursoClient: any = null;

/**
 * Get Turso database connection
 */
export function getTursoDatabase(): any {
  if (!TURSO_URL || !TURSO_AUTH_TOKEN) {
    throw new Error('Turso credentials not configured. Please set TURSO_URL and TURSO_AUTH_TOKEN environment variables.');
  }

  if (!tursoClient) {
    tursoClient = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    
    console.log('📊 Connected to Turso database');
  }

  return tursoClient;
}

/**
 * Execute a query with parameters
 */
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  const db = getTursoDatabase();
  return await db.execute(sql, params);
}

/**
 * Get a single row
 */
export async function getRow(sql: string, params: any[] = []): Promise<any> {
  const result = await executeQuery(sql, params);
  return result.rows[0] || null;
}

/**
 * Get multiple rows
 */
export async function getRows(sql: string, params: any[] = []): Promise<any[]> {
  const result = await executeQuery(sql, params);
  return result.rows || [];
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  teams: number;
  players: number;
  games: number;
  playerGameStats: number;
  playerSeasonStats: number;
  injuries: number;
}> {
  try {
    const teams = await getRow('SELECT COUNT(*) as count FROM teams');
    const players = await getRow('SELECT COUNT(*) as count FROM players');
    const games = await getRow('SELECT COUNT(*) as count FROM games');
    const playerGameStats = await getRow('SELECT COUNT(*) as count FROM player_game_stats');
    const playerSeasonStats = await getRow('SELECT COUNT(*) as count FROM player_season_stats');
    const injuries = await getRow('SELECT COUNT(*) as count FROM injuries');
    
    return {
      teams: teams?.count || 0,
      players: players?.count || 0,
      games: games?.count || 0,
      playerGameStats: playerGameStats?.count || 0,
      playerSeasonStats: playerSeasonStats?.count || 0,
      injuries: injuries?.count || 0,
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
 * Close database connection (Turso handles this automatically)
 */
export function closeDatabase(): void {
  // Turso connections are stateless, no need to close
  console.log('📊 Turso connection closed (stateless)');
}
