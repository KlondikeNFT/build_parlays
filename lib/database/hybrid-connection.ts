/**
 * Hybrid Database Connection
 * Uses SQLite for local development, Turso for production
 */

import { getDatabase as getSQLiteDatabase, getDatabaseStats as getSQLiteStats } from './connection';
import { getTursoDatabase, getDatabaseStats as getTursoStats, executeQuery as tursoExecuteQuery, getRow as tursoGetRow, getRows as tursoGetRows } from './turso-connection';

// Check if we're in production (Vercel) or local development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
// Always use Turso in production, regardless of env vars (they're hardcoded in turso-connection.ts)
const shouldUseTurso = isProduction;

/**
 * Get the appropriate database connection
 */
export function getDatabase(): any {
  // Use Turso in production
  if (shouldUseTurso) {
    console.log('📊 Using Turso database in production');
    return getTursoDatabase();
  }

  // Use SQLite for local development
  console.log('📊 Using SQLite database locally');
  return getSQLiteDatabase();
}

/**
 * Execute a query (works with both SQLite and Turso)
 */
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  if (shouldUseTurso) {
    return await tursoExecuteQuery(sql, params);
  }

  // SQLite for local development
  const db = getSQLiteDatabase();
  if (params.length === 0) {
    return db.exec(sql);
  } else {
    return db.prepare(sql).run(params);
  }
}

/**
 * Get a single row
 */
export async function getRow(sql: string, params: any[] = []): Promise<any> {
  if (shouldUseTurso) {
    return await tursoGetRow(sql, params);
  }

  // SQLite for local development
  const db = getSQLiteDatabase();
  if (params.length === 0) {
    return db.prepare(sql).get();
  } else {
    return db.prepare(sql).get(params);
  }
}

/**
 * Get multiple rows
 */
export async function getRows(sql: string, params: any[] = []): Promise<any[]> {
  if (shouldUseTurso) {
    return await tursoGetRows(sql, params);
  }

  // SQLite for local development
  const db = getSQLiteDatabase();
  if (params.length === 0) {
    return db.prepare(sql).all();
  } else {
    return db.prepare(sql).all(params);
  }
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
  if (shouldUseTurso) {
    return await getTursoStats();
  }

  // SQLite for local development
  return getSQLiteStats();
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (shouldUseTurso) {
    // Turso connections are stateless
    console.log('📊 Turso connection closed (stateless)');
  } else {
    // Close SQLite connection
    const { closeDatabase: closeSQLite } = require('./connection');
    closeSQLite();
  }
}