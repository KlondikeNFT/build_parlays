/**
 * Database Query Functions
 * Pre-built queries for common NFL data operations
 */

import { getRows, getRow } from './hybrid-connection';

// Types for database results
export interface Team {
  team_id: string;
  team_name: string;
  team_abbr: string;
  team_conference: string;
  team_division: string;
  team_color_primary?: string;
  team_color_secondary?: string;
  team_logo_url?: string;
  wins?: number;
  losses?: number;
  ties?: number;
  win_percentage?: number;
  games_played?: number;
}

export interface Player {
  player_id: number;
  player_name: string;
  player_display_name?: string;
  first_name?: string;
  last_name?: string;
  position: string;
  team?: string;
  jersey_number?: number;
  height?: string;
  weight?: number;
  birth_date?: string;
  college?: string;
  experience?: number;
  headshot_url?: string;
  status: string;
}

export interface Game {
  game_id: string;
  season: number;
  week: number;
  game_type: string;
  game_date?: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  game_status: string;
  weather?: string;
}

export interface PlayerGameStats {
  id: number;
  player_id: number;
  game_id: string;
  season: number;
  week: number;
  team: string;
  opponent: string;
  home_away: string;
  played: number;
  started: number;
  passing_attempts: number;
  passing_completions: number;
  passing_yards: number;
  passing_touchdowns: number;
  passing_interceptions: number;
  passing_rating: number;
  rushing_attempts: number;
  rushing_yards: number;
  rushing_touchdowns: number;
  targets: number;
  receptions: number;
  receiving_yards: number;
  receiving_touchdowns: number;
  fantasy_points: number;
  fantasy_points_ppr: number;
}

export interface PlayerSeasonStats {
  id: number;
  player_id: number;
  season: number;
  team: string;
  position: string;
  games_played: number;
  games_started: number;
  passing_attempts: number;
  passing_completions: number;
  passing_yards: number;
  passing_touchdowns: number;
  passing_interceptions: number;
  passing_rating: number;
  rushing_attempts: number;
  rushing_yards: number;
  rushing_touchdowns: number;
  targets: number;
  receptions: number;
  receiving_yards: number;
  receiving_touchdowns: number;
  fantasy_points: number;
  fantasy_points_ppr: number;
}

/**
 * Get all teams with current season records
 */
export async function getAllTeams(): Promise<Team[]> {
  return await getRows(`
    SELECT 
      t.*,
      tr.wins,
      tr.losses,
      tr.ties,
      tr.win_percentage,
      tr.games_played
    FROM teams t
    LEFT JOIN team_records tr ON t.team_id = tr.team_id AND tr.season = 2025
    ORDER BY t.team_name
  `) as Team[];
}

/**
 * Get team by abbreviation
 */
export function getTeamByAbbr(teamAbbr: string): Team | null {
  const db = getDatabase();
  return db.prepare('SELECT * FROM teams WHERE team_abbr = ?').get(teamAbbr) as Team | null;
}

/**
 * Get all players
 */
export function getAllPlayers(): Player[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM players ORDER BY player_name').all() as Player[];
}

/**
 * Get players by team
 */
export function getPlayersByTeam(teamAbbr: string): Player[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM players WHERE team = ? ORDER BY position, player_name').all(teamAbbr) as Player[];
}

/**
 * Get players by position
 */
export function getPlayersByPosition(position: string): Player[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM players WHERE position = ? ORDER BY player_name').all(position) as Player[];
}

/**
 * Get player by ID
 */
export function getPlayerById(playerId: number): Player | null {
  const db = getDatabase();
  return db.prepare('SELECT * FROM players WHERE player_id = ?').get(playerId) as Player | null;
}

/**
 * Search players by name
 */
export function searchPlayersByName(searchTerm: string): Player[] {
  const db = getDatabase();
  const term = `%${searchTerm}%`;
  return db.prepare(`
    SELECT * FROM players 
    WHERE player_name LIKE ? OR first_name LIKE ? OR last_name LIKE ?
    ORDER BY player_name
  `).all(term, term, term) as Player[];
}

/**
 * Get games by season
 */
export function getGamesBySeason(season: number): Game[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM games WHERE season = ? ORDER BY week, game_date').all(season) as Game[];
}

/**
 * Get games by week
 */
export function getGamesByWeek(season: number, week: number): Game[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM games WHERE season = ? AND week = ? ORDER BY game_date').all(season, week) as Game[];
}

/**
 * Get player game stats by player ID
 */
export function getPlayerGameStats(playerId: number, season?: number): PlayerGameStats[] {
  const db = getDatabase();
  
  if (season) {
    return db.prepare(`
      SELECT * FROM player_game_stats 
      WHERE player_id = ? AND season = ? 
      ORDER BY week DESC
    `).all(playerId, season) as PlayerGameStats[];
  } else {
    return db.prepare(`
      SELECT * FROM player_game_stats 
      WHERE player_id = ? 
      ORDER BY season DESC, week DESC
    `).all(playerId) as PlayerGameStats[];
  }
}

/**
 * Get player season stats
 */
export function getPlayerSeasonStats(playerId: number, season?: number): PlayerSeasonStats[] {
  const db = getDatabase();
  
  if (season) {
    return db.prepare(`
      SELECT * FROM player_season_stats 
      WHERE player_id = ? AND season = ?
    `).all(playerId, season) as PlayerSeasonStats[];
  } else {
    return db.prepare(`
      SELECT * FROM player_season_stats 
      WHERE player_id = ? 
      ORDER BY season DESC
    `).all(playerId) as PlayerSeasonStats[];
  }
}

/**
 * Get top players by position and stat
 */
export function getTopPlayersByStat(
  position: string, 
  stat: string, 
  season: number, 
  limit: number = 10
): (PlayerSeasonStats & Player)[] {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT p.*, s.*
    FROM players p
    JOIN player_season_stats s ON p.player_id = s.player_id
    WHERE p.position = ? AND s.season = ? AND s.${stat} > 0
    ORDER BY s.${stat} DESC
    LIMIT ?
  `).all(position, season, limit) as (PlayerSeasonStats & Player)[];
}

/**
 * Get current season top performers
 */
export function getCurrentSeasonTopPerformers(season: number = 2024): {
  qbs: (PlayerSeasonStats & Player)[];
  rbs: (PlayerSeasonStats & Player)[];
  wrs: (PlayerSeasonStats & Player)[];
  tes: (PlayerSeasonStats & Player)[];
} {
  return {
    qbs: getTopPlayersByStat('QB', 'passing_yards', season, 5),
    rbs: getTopPlayersByStat('RB', 'rushing_yards', season, 5),
    wrs: getTopPlayersByStat('WR', 'receiving_yards', season, 5),
    tes: getTopPlayersByStat('TE', 'receiving_yards', season, 3),
  };
}

/**
 * Get player with full stats (for player detail page)
 */
export function getPlayerWithFullStats(playerId: number, season: number = 2024): {
  player: Player | null;
  seasonStats: PlayerSeasonStats | null;
  gameLog: PlayerGameStats[];
} {
  const player = getPlayerById(playerId);
  const seasonStats = getPlayerSeasonStats(playerId, season)[0] || null;
  const gameLog = getPlayerGameStats(playerId, season);
  
  return {
    player,
    seasonStats,
    gameLog,
  };
}

/**
 * Get team roster with stats
 */
export function getTeamRosterWithStats(teamAbbr: string, season: number = 2024): (Player & { seasonStats?: PlayerSeasonStats })[] {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT p.*, s.*
    FROM players p
    LEFT JOIN player_season_stats s ON p.player_id = s.player_id AND s.season = ?
    WHERE p.team = ?
    ORDER BY p.position, p.player_name
  `).all(season, teamAbbr) as (Player & { seasonStats?: PlayerSeasonStats })[];
}

/**
 * Get upcoming games
 */
export function getUpcomingGames(season: number = 2024, limit: number = 10): Game[] {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT * FROM games 
    WHERE season = ? AND game_status = 'scheduled' 
    ORDER BY game_date ASC 
    LIMIT ?
  `).all(season, limit) as Game[];
}

/**
 * Get recent games
 */
export function getRecentGames(season: number = 2024, limit: number = 10): Game[] {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT * FROM games 
    WHERE season = ? AND game_status = 'final' 
    ORDER BY game_date DESC 
    LIMIT ?
  `).all(season, limit) as Game[];
}

