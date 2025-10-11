/**
 * Player Service using SportsDataIO
 * Fetches real player stats and performance data
 */

import { sportsdataApi, CURRENT_SEASON } from './sportsdataio';

export interface PlayerWithStats {
  player: any;
  seasonStats: any;
  gameLog: any[];
}

/**
 * Get player with full stats
 */
export async function getPlayerWithStats(playerName: string, team: string): Promise<PlayerWithStats | null> {
  try {
    console.log(`📡 Fetching data for ${playerName} (${team})...`);
    
    // Get roster to find player
    const roster = await sportsdataApi.getTeamPlayers(team);
    const player = roster.find(p => 
      `${p.FirstName} ${p.LastName}`.toLowerCase().includes(playerName.toLowerCase()) ||
      playerName.toLowerCase().includes(p.LastName.toLowerCase())
    );
    
    if (!player) {
      console.warn(`Player ${playerName} not found on ${team} roster`);
      return null;
    }
    
    // Get their stats for CURRENT SEASON (2025)
    const [allSeasonStats, gameLog] = await Promise.all([
      sportsdataApi.getPlayerSeasonStats(CURRENT_SEASON),
      sportsdataApi.getPlayerGameLogs(CURRENT_SEASON, [player.PlayerID]),
    ]);
    
    const seasonStats = allSeasonStats.find(s => s.PlayerID === player.PlayerID);
    
    // Filter to just this player's games and sort by week (most recent first)
    const sortedGameLog = gameLog
      .filter(g => g.PlayerID === player.PlayerID && g.Played === 1) // Only include games where player actually played
      .sort((a, b) => b.Week - a.Week);
    
    console.log(`✅ Loaded data for ${player.FirstName} ${player.LastName} (${sortedGameLog.length} games)`);
    console.log('📊 SEASON STATS:', JSON.stringify(seasonStats, null, 2));
    console.log('📊 GAME LOG (first 3 games):', JSON.stringify(sortedGameLog.slice(0, 3), null, 2));
    
    return {
      player,
      seasonStats: seasonStats || {},
      gameLog: sortedGameLog,
    };
  } catch (error) {
    console.error(`❌ Error fetching player ${playerName}:`, error);
    return null;
  }
}

/**
 * Get full team name from abbreviation
 */
export function getFullTeamName(abbr: string): string {
  const teams: Record<string, string> = {
    'ARI': 'Arizona Cardinals',
    'ATL': 'Atlanta Falcons',
    'BAL': 'Baltimore Ravens',
    'BUF': 'Buffalo Bills',
    'CAR': 'Carolina Panthers',
    'CHI': 'Chicago Bears',
    'CIN': 'Cincinnati Bengals',
    'CLE': 'Cleveland Browns',
    'DAL': 'Dallas Cowboys',
    'DEN': 'Denver Broncos',
    'DET': 'Detroit Lions',
    'GB': 'Green Bay Packers',
    'HOU': 'Houston Texans',
    'IND': 'Indianapolis Colts',
    'JAX': 'Jacksonville Jaguars',
    'KC': 'Kansas City Chiefs',
    'LAC': 'Los Angeles Chargers',
    'LAR': 'Los Angeles Rams',
    'LV': 'Las Vegas Raiders',
    'MIA': 'Miami Dolphins',
    'MIN': 'Minnesota Vikings',
    'NE': 'New England Patriots',
    'NO': 'New Orleans Saints',
    'NYG': 'New York Giants',
    'NYJ': 'New York Jets',
    'PHI': 'Philadelphia Eagles',
    'PIT': 'Pittsburgh Steelers',
    'SEA': 'Seattle Seahawks',
    'SF': 'San Francisco 49ers',
    'TB': 'Tampa Bay Buccaneers',
    'TEN': 'Tennessee Titans',
    'WAS': 'Washington Commanders',
  };
  
  return teams[abbr] || abbr;
}

