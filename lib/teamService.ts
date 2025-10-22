/**
 * Team Service
 * Uses local NFL database from NFLverse data
 */

// Database queries will be called via API routes to avoid client-side issues

// Re-export types for compatibility
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

interface SDStanding {
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
 * Get all NFL teams from database
 */
export async function getAllTeams(): Promise<TeamWithRecord[]> {
  try {
    console.log('📡 Loading NFL teams from database...');
    
    // Try to fetch from API route
    const response = await fetch('/api/database/teams');
    if (response.ok) {
      const teams = await response.json();
      
      if (teams.length === 0) {
        console.log('⚠️ No teams found in database. Using mock data...');
        return getMockTeams();
      }
      
      // Convert database teams to TeamWithRecord format
      const teamsWithRecords: TeamWithRecord[] = teams.map((team: any) => ({
        TeamID: parseInt(team.team_id) || 0,
        Key: team.team_abbr,
        City: team.team_name.split(' ')[0] || team.team_name,
        Name: team.team_name.split(' ').slice(1).join(' ') || team.team_name,
        FullName: team.team_name,
        StadiumID: 0,
        ByeWeek: 0,
        Conference: team.team_conference,
        Division: team.team_division,
        PrimaryColor: team.team_color_primary || '#000000',
        SecondaryColor: team.team_color_secondary || '#FFFFFF',
        WikipediaLogoUrl: team.team_logo_url || '',
        WikipediaWordMarkUrl: '',
        wins: team.wins || 0,
        losses: team.losses || 0,
        ties: team.ties || 0,
        record: `${team.wins || 0}-${team.losses || 0}`,
      }));
      
      console.log(`✅ Loaded ${teamsWithRecords.length} teams from database`);
      return teamsWithRecords;
    } else {
      throw new Error('Failed to fetch teams from API');
    }
  } catch (error) {
    console.error('❌ Error loading teams from database:', error);
    console.log('🔄 Falling back to mock data...');
    return getMockTeams();
  }
}

/**
 * Get mock teams as fallback
 */
function getMockTeams(): TeamWithRecord[] {
  return [
    {
      TeamID: 1,
      Key: 'KC',
      City: 'Kansas City',
      Name: 'Chiefs',
      FullName: 'Kansas City Chiefs',
      StadiumID: 1,
      ByeWeek: 10,
      Conference: 'AFC',
      Division: 'West',
      PrimaryColor: '#E31837',
      SecondaryColor: '#FFB81C',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
      wins: 12,
      losses: 5,
      ties: 0,
      record: '12-5',
    },
    {
      TeamID: 2,
      Key: 'BUF',
      City: 'Buffalo',
      Name: 'Bills',
      FullName: 'Buffalo Bills',
      StadiumID: 2,
      ByeWeek: 13,
      Conference: 'AFC',
      Division: 'East',
      PrimaryColor: '#00338D',
      SecondaryColor: '#C60C30',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
      wins: 11,
      losses: 6,
      ties: 0,
      record: '11-6',
    },
  ];
}

/**
 * Get team with full roster
 */
export async function getTeamWithRoster(teamAbbr: string): Promise<TeamWithRoster | null> {
  try {
    console.log(`📡 Loading roster for ${teamAbbr}...`);
    
    // For now, return mock data until we implement the API route
    const mockTeam: SDTeam = {
      TeamID: 1,
      Key: teamAbbr,
      City: 'Kansas City',
      Name: 'Chiefs',
      FullName: 'Kansas City Chiefs',
      StadiumID: 1,
      ByeWeek: 10,
      Conference: 'AFC',
      Division: 'West',
      PrimaryColor: '#E31837',
      SecondaryColor: '#FFB81C',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
    };
    
    const mockRoster: SDPlayer[] = [
      {
        PlayerID: 99999,
        Team: teamAbbr,
        Number: 15,
        FirstName: 'Patrick',
        LastName: 'Mahomes',
        Position: 'QB',
        Status: 'Active',
        Height: '6-3',
        Weight: 230,
        BirthDate: '1995-09-17',
        College: 'Texas Tech',
        Experience: 7,
        PhotoUrl: '',
        DepthOrder: 1,
        InjuryStatus: 'Active',
        InjuryBodyPart: '',
        Started: 17,
      },
    ];
    
    console.log(`✅ Loaded ${mockTeam.FullName} with ${mockRoster.length} players`);
    return { team: mockTeam, roster: mockRoster };
  } catch (error) {
    console.error(`❌ Error loading team ${teamAbbr}:`, error);
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
