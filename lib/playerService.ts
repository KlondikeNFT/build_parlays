/**
 * Player Service
 * Uses local NFL database from NFLverse data
 */

// Database queries will be called via API routes to avoid client-side issues
import { mockDataService, MOCK_PLAYER } from './mockData';

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
    
    // Check if this is a mock player (works in production too)
    if (mockDataService.isMockPlayer(playerName)) {
      console.log('🎭 Using mock data for mock player...');
      return await mockDataService.getMockPlayerWithStats();
    }
    
    // Try to fetch from database API using player ID if available
    try {
      // First, try to find the player by name to get their ID
      const searchResponse = await fetch(`/api/database/players?name=${encodeURIComponent(playerName)}`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.length > 0) {
          // Use the first matching player
          const playerId = searchData[0].PlayerID;
          console.log(`Found player ID: ${playerId} for ${playerName}`);
          
          // Now get the full player data
          const playerResponse = await fetch(`/api/database/players?id=${playerId}`);
          if (playerResponse.ok) {
            const playerData = await playerResponse.json();
            if (playerData.player) {
              console.log('✅ Retrieved player from database');
              return playerData;
            }
          }
        }
      }
    } catch (dbError) {
      console.warn('⚠️ Database API failed, falling back to mock data:', dbError);
    }
    
    // Fallback to mock data
    console.log('🎭 Using mock data as fallback...');
    return await mockDataService.getMockPlayerWithStats();
  } catch (error) {
    console.error(`❌ Error fetching player ${playerName}:`, error);
    return null;
  }
}

/**
 * Search for players and teams
 */
export async function searchPlayersAndTeams(query: string): Promise<{
  players: any[];
  teams: any[];
}> {
  try {
    console.log(`🔍 Searching for: "${query}"`);
    
    // Try to fetch from real database search API
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Retrieved search results from database');
        return {
          players: data.players || [],
          teams: data.teams || []
        };
      }
    } catch (dbError) {
      console.warn('⚠️ Database search API failed, falling back to mock data:', dbError);
    }
    
    // Fallback to mock data
    console.log('🎭 Using mock search data as fallback...');
    const results = await mockDataService.search(query);
    console.log('🎭 Mock search results:', results);
    return results;
  } catch (error) {
    console.error('❌ Error searching:', error);
    return { players: [], teams: [] };
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

