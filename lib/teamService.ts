/**
 * Team Service using SportsDataIO
 * Fetches real team rosters and player data
 */

import { sportsdataApi, CURRENT_SEASON, type SDTeam, type SDPlayer, type SDStanding } from './sportsdataio';

export interface TeamWithRecord extends SDTeam {
  record?: string;
  wins?: number;
  losses?: number;
  ties?: number;
}

export interface TeamWithRoster {
  team: SDTeam;
  roster: SDPlayer[];
}

/**
 * Get all NFL teams from SportsDataIO with current season records
 */
export async function getAllTeams(): Promise<TeamWithRecord[]> {
  try {
    console.log('📡 Fetching all NFL teams from SportsDataIO...');
    const [teams, standings] = await Promise.all([
      sportsdataApi.getTeams(),
      sportsdataApi.getStandings(CURRENT_SEASON),
    ]);
    
    // Create standings map for quick lookup
    const standingsMap = new Map<string, SDStanding>();
    standings.forEach(s => standingsMap.set(s.Team, s));
    
    // Merge teams with their records
    const teamsWithRecords: TeamWithRecord[] = teams.map(team => {
      const standing = standingsMap.get(team.Key);
      if (standing) {
        return {
          ...team,
          wins: standing.Wins,
          losses: standing.Losses,
          ties: standing.Ties,
          record: `${standing.Wins}-${standing.Losses}${standing.Ties > 0 ? `-${standing.Ties}` : ''}`,
        };
      }
      return team;
    });
    
    console.log(`✅ Loaded ${teamsWithRecords.length} teams with records`);
    return teamsWithRecords;
  } catch (error) {
    console.error('❌ Error fetching teams:', error);
    return [];
  }
}

/**
 * Get team with full roster
 */
export async function getTeamWithRoster(teamAbbr: string): Promise<TeamWithRoster | null> {
  try {
    console.log(`📡 Fetching ${teamAbbr} roster...`);
    const [teams, roster] = await Promise.all([
      sportsdataApi.getTeams(),
      sportsdataApi.getTeamPlayers(teamAbbr),
    ]);
    
    const team = teams.find(t => t.Key === teamAbbr);
    if (!team) {
      console.error(`Team ${teamAbbr} not found`);
      return null;
    }
    
    console.log(`✅ Loaded ${team.FullName} with ${roster.length} players`);
    return { team, roster };
  } catch (error) {
    console.error(`❌ Error fetching team ${teamAbbr}:`, error);
    return null;
  }
}

/**
 * Group roster by position with depth order
 */
export function groupRosterByPosition(roster: SDPlayer[]): Record<string, SDPlayer[]> {
  const grouped: Record<string, SDPlayer[]> = {};

  // Group players by their exact position
  roster.forEach(player => {
    const pos = player.Position.toUpperCase();
    if (!grouped[pos]) {
      grouped[pos] = [];
    }
    grouped[pos].push(player);
  });

  // Sort each position group by:
  // 1. Players who have started games (descending)
  // 2. DepthOrder if available
  // 3. Experience (more experienced first)
  // 4. Name alphabetically
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      // First priority: Games started (starters first)
      const aStarts = a.Started || 0;
      const bStarts = b.Started || 0;
      if (aStarts !== bStarts) {
        return bStarts - aStarts; // More starts = higher priority
      }
      
      // Second priority: DepthOrder if both have valid values
      const aDepth = a.DepthOrder || 99;
      const bDepth = b.DepthOrder || 99;
      if (aDepth !== bDepth && aDepth !== 99 && bDepth !== 99) {
        return aDepth - bDepth;
      }
      
      // Third priority: Experience (veterans first within same depth)
      const aExp = a.Experience || 0;
      const bExp = b.Experience || 0;
      if (aExp !== bExp) {
        return bExp - aExp;
      }
      
      // Last resort: Alphabetical by last name
      return (a.LastName || '').localeCompare(b.LastName || '');
    });
  });

  return grouped;
}

/**
 * Get depth label for player based on their index in the position group
 */
export function getDepthLabel(position: string, index: number): string {
  return `${position}${index + 1}`;
}

/**
 * Get depth badge color based on depth index
 */
export function getDepthBadgeColor(index: number): string {
  if (index === 0) return 'bg-green-100 text-green-800 border-green-300'; // Starter
  if (index === 1) return 'bg-blue-100 text-blue-800 border-blue-300'; // 2nd string
  if (index === 2) return 'bg-yellow-100 text-yellow-800 border-yellow-300'; // 3rd string
  return 'bg-gray-100 text-gray-800 border-gray-300'; // Backup
}

/**
 * Get readable position name
 */
export function getPositionName(abbreviation: string): string {
  const positions: Record<string, string> = {
    QB: 'Quarterbacks',
    RB: 'Running Backs',
    FB: 'Fullbacks',
    WR: 'Wide Receivers',
    TE: 'Tight Ends',
    OT: 'Offensive Tackles',
    OG: 'Offensive Guards',
    C: 'Centers',
    G: 'Guards',
    T: 'Tackles',
    DE: 'Defensive Ends',
    DT: 'Defensive Tackles',
    NT: 'Nose Tackles',
    LB: 'Linebackers',
    ILB: 'Inside Linebackers',
    OLB: 'Outside Linebackers',
    MLB: 'Middle Linebackers',
    CB: 'Cornerbacks',
    S: 'Safeties',
    SS: 'Strong Safeties',
    FS: 'Free Safeties',
    DB: 'Defensive Backs',
    K: 'Kickers',
    P: 'Punters',
    LS: 'Long Snappers',
  };

  return positions[abbreviation] || abbreviation;
}
