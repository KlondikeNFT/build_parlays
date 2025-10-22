/**
 * Hybrid Database Connection
 * Uses SQLite for local development, Turso for production
 */

import { getDatabase as getSQLiteDatabase, getDatabaseStats as getSQLiteStats } from './connection';
import { getTursoDatabase, getDatabaseStats as getTursoStats, executeQuery as tursoExecuteQuery, getRow as tursoGetRow, getRows as tursoGetRows } from './turso-connection';

// Check if we're in production (Vercel) or local development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const hasTursoCredentials = process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN;

/**
 * Get the appropriate database connection
 */
export function getDatabase(): any {
  // Use Turso in production or if credentials are available
  if (isProduction || hasTursoCredentials) {
    try {
      return getTursoDatabase();
    } catch (error) {
      console.warn('⚠️  Turso connection failed, falling back to SQLite:', error);
    }
  }

  // Fall back to SQLite for local development
  return getSQLiteDatabase();
}

/**
 * Execute a query (works with both SQLite and Turso)
 */
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  if (isProduction || hasTursoCredentials) {
    try {
      return await tursoExecuteQuery(sql, params);
    } catch (error) {
      console.warn('⚠️  Turso query failed, falling back to SQLite:', error);
    }
  }

  // SQLite fallback
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
  if (isProduction || hasTursoCredentials) {
    try {
      return await tursoGetRow(sql, params);
    } catch (error) {
      console.warn('⚠️  Turso query failed, falling back to SQLite:', error);
    }
  }

  // SQLite fallback
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
  if (isProduction || hasTursoCredentials) {
    try {
      return await tursoGetRows(sql, params);
    } catch (error) {
      console.warn('⚠️  Turso query failed, falling back to SQLite:', error);
    }
  }

  // SQLite fallback
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
  if (isProduction || hasTursoCredentials) {
    try {
      return await getTursoStats();
    } catch (error) {
      console.warn('⚠️  Turso stats failed, falling back to SQLite:', error);
    }
  }

  // SQLite fallback
  return getSQLiteStats();
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (isProduction || hasTursoCredentials) {
    // Turso connections are stateless
    console.log('📊 Turso connection closed (stateless)');
  } else {
    // Close SQLite connection
    const { closeDatabase: closeSQLite } = require('./connection');
    closeSQLite();
  }
}