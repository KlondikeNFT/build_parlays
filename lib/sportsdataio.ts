/**
 * SportsDataIO API Integration
 * Professional NFL data provider with real stats, injuries, depth charts
 */

import axios from 'axios';

const API_KEY = process.env.SPORTSDATA_API_KEY || '69641481ea3e47728270d996b5132104';
const BASE_URL = 'https://api.sportsdata.io/v3/nfl';

// For trial/free tier, use scores endpoint
const SCORES_BASE = `${BASE_URL}/scores/json`;
const STATS_BASE = `${BASE_URL}/stats/json`;

// Current NFL season (updates automatically)
export const CURRENT_SEASON = '2025'; // October 2025 = 2025 season

export interface SDTeam {
  TeamID: number;
  Key: string;
  City: string;
  Name: string;
  FullName: string;
  StadiumID: number;
  ByeWeek: number;
  Conference: string;
  Division: string;
  PrimaryColor: string;
  SecondaryColor: string;
  WikipediaLogoUrl: string;
  WikipediaWordMarkUrl: string;
}

export interface SDPlayer {
  PlayerID: number;
  Team: string;
  Number: number;
  FirstName: string;
  LastName: string;
  Position: string;
  Status: string;
  Height: string;
  Weight: number;
  BirthDate: string;
  College: string;
  Experience: number;
  PhotoUrl: string;
  DepthOrder: number;
  InjuryStatus: string;
  InjuryBodyPart: string;
  Started?: number;
}

export interface SDInjury {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Status: string;
  BodyPart?: string;
  Practice?: string;
  StartDate?: string;
}

export interface SDPlayerGame {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Week: number;
  Opponent: string;
  HomeOrAway: string;
  Played: number;
  // Passing stats
  PassingYards: number;
  PassingTouchdowns: number;
  PassingInterceptions: number;
  PassingCompletions: number;
  PassingAttempts: number;
  // Rushing stats
  RushingYards: number;
  RushingTouchdowns: number;
  RushingAttempts: number;
  // Receiving stats
  ReceivingYards: number;
  ReceivingTouchdowns: number;
  Receptions: number;
  Targets: number;
}

export interface SDInjury {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Status: string;
  InjuryStatus?: string;
  InjuryBodyPart?: string;
}

export interface SDPlayerSeason {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Played: number;
  Started: number;
  PassingYards?: number;
  PassingTouchdowns?: number;
  PassingInterceptions?: number;
  RushingYards?: number;
  RushingTouchdowns?: number;
  RushingAttempts?: number;
  ReceivingYards?: number;
  ReceivingTouchdowns?: number;
  Receptions?: number;
  ReceivingTargets?: number;
}

export interface SDStanding {
  Team: string;
  Name: string;
  Wins: number;
  Losses: number;
  Ties: number;
  Percentage: number;
  Conference: string;
  Division: string;
  DivisionRank: number;
  ConferenceRank: number;
}

export interface SDSchedule {
  GameKey?: string;
  ScoreID?: number;
  Week: number;
  Date?: string;
  DateTime?: string;
  AwayTeam: string;
  HomeTeam: string;
  AwayScore?: number;
  HomeScore?: number;
  Channel?: string;
  IsClosed?: boolean;
}

export const sportsdataApi = {
  /**
   * Get all NFL teams
   */
  async getTeams(): Promise<SDTeam[]> {
    try {
      const response = await axios.get(`${SCORES_BASE}/Teams?key=${API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teams from SportsDataIO:', error);
      return [];
    }
  },

  /**
   * Get players for a specific team
   */
  async getTeamPlayers(team: string): Promise<SDPlayer[]> {
    try {
      const response = await axios.get(`${SCORES_BASE}/Players/${team}?key=${API_KEY}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching players for ${team}:`, error);
      return [];
    }
  },

  /**
   * Get player game stats for current season
   */
  async getPlayerGameStats(season: string, week: string): Promise<SDPlayerGame[]> {
    try {
      const response = await axios.get(
        `${STATS_BASE}/PlayerGameStatsByWeek/${season}/${week}?key=${API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching player game stats:', error);
      return [];
    }
  },

  /**
   * Get player season stats
   */
  async getPlayerSeasonStats(season: string): Promise<SDPlayerSeason[]> {
    try {
      const response = await axios.get(
        `${STATS_BASE}/PlayerSeasonStats/${season}?key=${API_KEY}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching season stats:', error);
      return [];
    }
  },

  /**
   * Get current week number
   */
  async getCurrentWeek(): Promise<number> {
    try {
      const response = await axios.get(`${SCORES_BASE}/CurrentWeek?key=${API_KEY}`);
      return response.data || 1;
    } catch (error) {
      console.error('Error fetching current week:', error);
      return 1;
    }
  },

  /**
   * Get injuries
   */
  async getInjuries(): Promise<SDInjury[]> {
    try {
      const response = await axios.get(`${SCORES_BASE}/Injuries?key=${API_KEY}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching injuries:', error);
      return [];
    }
  },

  /**
   * Get player game logs for the season (optionally limit number of games)
   */
  async getPlayerSeasonGameStats(
    season: string,
    playerId: number,
    numberOfGames = 8
  ): Promise<SDPlayerGame[]> {
    const baseUrl = `${STATS_BASE}/PlayerGameStatsBySeason/${season}/${playerId}`;
    const urls = [
      `${baseUrl}/${numberOfGames}?key=${API_KEY}`,
      `${baseUrl}?key=${API_KEY}`,
    ];

    for (const url of urls) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error(
          `Error fetching season game stats for player ${playerId} using ${url}:`,
          error instanceof Error ? error.message : error
        );
      }
    }

    return [];
  },

  /**
   * Get depth charts for a team
   */
  async getDepthChart(team: string): Promise<any[]> {
    try {
      const response = await axios.get(`${SCORES_BASE}/DepthCharts/${team}?key=${API_KEY}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching depth chart for ${team}:`, error);
      return [];
    }
  },

  /**
   * Get schedules
   */
  async getSchedule(season: string): Promise<SDSchedule[]> {
    try {
      const response = await axios.get(`${SCORES_BASE}/Schedules/${season}?key=${API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return [];
    }
  },

  /**
   * Get top performers from current season stats
   */
  async getTopPerformers(): Promise<SDPlayerSeason[]> {
    try {
      const currentSeason = CURRENT_SEASON;
      
      // Get season stats for all players
      const seasonStats = await this.getPlayerSeasonStats(currentSeason);
      
      if (seasonStats.length === 0) {
        console.warn('No season stats available');
        return [];
      }
      
      // Sort by relevant stats and get top players by position
      const qbs = seasonStats
        .filter(p => p.Position === 'QB' && p.Played > 5)
        .sort((a, b) => (b.PassingYards || 0) - (a.PassingYards || 0))
        .slice(0, 3);
      
      const rbs = seasonStats
        .filter(p => p.Position === 'RB' && p.Played > 5)
        .sort((a, b) => (b.RushingYards || 0) - (a.RushingYards || 0))
        .slice(0, 3);
      
      const wrs = seasonStats
        .filter(p => (p.Position === 'WR' || p.Position === 'TE') && p.Played > 5)
        .sort((a, b) => (b.ReceivingYards || 0) - (a.ReceivingYards || 0))
        .slice(0, 4);
      
      return [...qbs, ...rbs, ...wrs];
      
    } catch (error) {
      console.error('Error getting top performers:', error);
      return [];
    }
  },

  /**
   * Get player game logs (week-by-week stats) for a specific player in a season
   * Returns array of game-by-game performance data
   */
  async getPlayerGameLogs(
    season: string,
    playerIds: number[]
  ): Promise<SDPlayerGame[]> {
    try {
      // Get current week to know how many weeks to fetch
      const currentWeek = await this.getCurrentWeek();
      const weeksToFetch = Math.min(currentWeek, 18); // Don't fetch more than 18 weeks
      
      const weeks = Array.from({ length: weeksToFetch }, (_, i) => i + 1);
      const allGames: SDPlayerGame[] = [];

      for (const week of weeks) {
        try {
          const weekGames = await this.getPlayerGameStats(season, week.toString());
          // Filter to only the players we're interested in
          const relevantGames = weekGames.filter((game: SDPlayerGame) =>
            playerIds.includes(game.PlayerID)
          );
          if (relevantGames.length > 0) {
            console.log(`Week ${week}: Found ${relevantGames.length} game(s) for player(s)`);
            // Log first game details for debugging
            if (week <= 3) {
              console.log(`Week ${week} sample game:`, JSON.stringify(relevantGames[0], null, 2));
            }
          }
          allGames.push(...relevantGames);
        } catch (error) {
          console.warn(`Failed to fetch week ${week}:`, error);
          // Continue with other weeks
        }
      }

      console.log(`📊 Fetched ${allGames.length} total games for ${playerIds.length} player(s) through week ${weeksToFetch}`);
      return allGames;
    } catch (error) {
      console.error('Error getting player game logs:', error);
      return [];
    }
  },

  /**
   * Get current season standings (team records)
   */
  async getStandings(season: string): Promise<SDStanding[]> {
    try {
      const response = await axios.get(`${SCORES_BASE}/Standings/${season}?key=${API_KEY}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching standings:', error);
      return [];
    }
  },
};
