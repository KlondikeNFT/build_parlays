/**
 * Mock Database for Development
 * Provides test data for local development without API calls
 */

export interface MockPlayer {
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

export interface MockPlayerSeason {
  PlayerID: number;
  Name: string;
  Team: string;
  Position: string;
  Played: number;
  Started: number;
  PassingYards?: number;
  PassingTouchdowns?: number;
  PassingInterceptions?: number;
  PassingCompletions?: number;
  PassingAttempts?: number;
  PassingRating?: number;
  RushingYards?: number;
  RushingTouchdowns?: number;
  RushingAttempts?: number;
  RushingYardsPerAttempt?: number;
  ReceivingYards?: number;
  ReceivingTouchdowns?: number;
  Receptions?: number;
  ReceivingTargets?: number;
  FantasyPointsPPR?: number;
}

export interface MockPlayerGame {
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

// Mock Player Data
export const MOCK_PLAYER: MockPlayer = {
  PlayerID: 99999,
  Team: 'KC',
  Number: 15,
  FirstName: 'Mock',
  LastName: 'Player',
  Position: 'QB',
  Status: 'Active',
  Height: '6-3',
  Weight: 215,
  BirthDate: '1990-01-01T00:00:00',
  College: 'Mock University',
  Experience: 8,
  PhotoUrl: '',
  DepthOrder: 1,
  InjuryStatus: 'Active',
  InjuryBodyPart: '',
  Started: 8
};

// Mock Season Stats for Mock Player
export const MOCK_SEASON_STATS: MockPlayerSeason = {
  PlayerID: 99999,
  Name: 'Mock Player',
  Team: 'KC',
  Position: 'QB',
  Played: 8,
  Started: 8,
  PassingYards: 2456,
  PassingTouchdowns: 18,
  PassingInterceptions: 7,
  PassingCompletions: 198,
  PassingAttempts: 312,
  PassingRating: 96.8,
  RushingYards: 234,
  RushingTouchdowns: 3,
  RushingAttempts: 42,
  RushingYardsPerAttempt: 5.6,
  FantasyPointsPPR: 245.6
};

// Mock Game Log for Mock Player (8 games)
export const MOCK_GAME_LOG: MockPlayerGame[] = [
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 8,
    Opponent: 'DEN',
    HomeOrAway: 'HOME',
    Played: 1,
    PassingYards: 312,
    PassingTouchdowns: 3,
    PassingInterceptions: 1,
    PassingCompletions: 24,
    PassingAttempts: 38,
    RushingYards: 28,
    RushingTouchdowns: 0,
    RushingAttempts: 5,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 7,
    Opponent: 'LAC',
    HomeOrAway: 'AWAY',
    Played: 1,
    PassingYards: 289,
    PassingTouchdowns: 2,
    PassingInterceptions: 0,
    PassingCompletions: 22,
    PassingAttempts: 35,
    RushingYards: 42,
    RushingTouchdowns: 1,
    RushingAttempts: 6,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 6,
    Opponent: 'BUF',
    HomeOrAway: 'HOME',
    Played: 1,
    PassingYards: 267,
    PassingTouchdowns: 1,
    PassingInterceptions: 2,
    PassingCompletions: 19,
    PassingAttempts: 33,
    RushingYards: 31,
    RushingTouchdowns: 0,
    RushingAttempts: 4,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 5,
    Opponent: 'LV',
    HomeOrAway: 'AWAY',
    Played: 1,
    PassingYards: 298,
    PassingTouchdowns: 2,
    PassingInterceptions: 1,
    PassingCompletions: 25,
    PassingAttempts: 39,
    RushingYards: 19,
    RushingTouchdowns: 0,
    RushingAttempts: 3,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 4,
    Opponent: 'TB',
    HomeOrAway: 'HOME',
    Played: 1,
    PassingYards: 334,
    PassingTouchdowns: 3,
    PassingInterceptions: 0,
    PassingCompletions: 26,
    PassingAttempts: 41,
    RushingYards: 45,
    RushingTouchdowns: 1,
    RushingAttempts: 7,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 3,
    Opponent: 'ATL',
    HomeOrAway: 'AWAY',
    Played: 1,
    PassingYards: 275,
    PassingTouchdowns: 2,
    PassingInterceptions: 1,
    PassingCompletions: 21,
    PassingAttempts: 34,
    RushingYards: 38,
    RushingTouchdowns: 0,
    RushingAttempts: 6,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 2,
    Opponent: 'CIN',
    HomeOrAway: 'HOME',
    Played: 1,
    PassingYards: 301,
    PassingTouchdowns: 3,
    PassingInterceptions: 1,
    PassingCompletions: 23,
    PassingAttempts: 37,
    RushingYards: 15,
    RushingTouchdowns: 0,
    RushingAttempts: 2,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  },
  {
    PlayerID: 99999,
    Name: 'Mock Player',
    Team: 'KC',
    Position: 'QB',
    Week: 1,
    Opponent: 'BAL',
    HomeOrAway: 'AWAY',
    Played: 1,
    PassingYards: 280,
    PassingTouchdowns: 2,
    PassingInterceptions: 1,
    PassingCompletions: 20,
    PassingAttempts: 35,
    RushingYards: 16,
    RushingTouchdowns: 1,
    RushingAttempts: 4,
    ReceivingYards: 0,
    ReceivingTouchdowns: 0,
    Receptions: 0,
    Targets: 0
  }
];

// Additional mock players for search functionality
export const MOCK_PLAYERS: MockPlayer[] = [
  MOCK_PLAYER,
  {
    PlayerID: 99998,
    Team: 'KC',
    Number: 87,
    FirstName: 'Mock',
    LastName: 'Receiver',
    Position: 'WR',
    Status: 'Active',
    Height: '6-1',
    Weight: 200,
    BirthDate: '1992-05-15T00:00:00',
    College: 'Mock State',
    Experience: 5,
    PhotoUrl: '',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 8
  },
  {
    PlayerID: 99997,
    Team: 'KC',
    Number: 25,
    FirstName: 'Mock',
    LastName: 'Runner',
    Position: 'RB',
    Status: 'Active',
    Height: '5-10',
    Weight: 220,
    BirthDate: '1994-08-22T00:00:00',
    College: 'Mock Tech',
    Experience: 4,
    PhotoUrl: '',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 7
  }
];

export const MOCK_SEARCH_RESULTS = {
  players: MOCK_PLAYERS,
  teams: [
    {
      TeamID: 12,
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
      WikipediaWordMarkUrl: ''
    }
  ]
};

/**
 * Mock Data Service
 * Simulates API responses for development
 */
export const mockDataService = {
  /**
   * Search for players and teams
   */
  async search(query: string): Promise<{
    players: MockPlayer[];
    teams: any[];
  }> {
    const lowerQuery = query.toLowerCase();
    
    const matchingPlayers = MOCK_PLAYERS.filter(player => 
      `${player.FirstName} ${player.LastName}`.toLowerCase().includes(lowerQuery) ||
      player.LastName.toLowerCase().includes(lowerQuery) ||
      player.Position.toLowerCase().includes(lowerQuery) ||
      player.Team.toLowerCase().includes(lowerQuery)
    );

    const matchingTeams = MOCK_SEARCH_RESULTS.teams.filter(team =>
      team.FullName.toLowerCase().includes(lowerQuery) ||
      team.Name.toLowerCase().includes(lowerQuery) ||
      team.City.toLowerCase().includes(lowerQuery) ||
      team.Key.toLowerCase().includes(lowerQuery)
    );

    return {
      players: matchingPlayers,
      teams: matchingTeams
    };
  },

  /**
   * Get mock player with stats
   */
  async getMockPlayerWithStats(): Promise<{
    player: MockPlayer;
    seasonStats: MockPlayerSeason;
    gameLog: MockPlayerGame[];
  }> {
    return {
      player: MOCK_PLAYER,
      seasonStats: MOCK_SEASON_STATS,
      gameLog: MOCK_GAME_LOG
    };
  },

  /**
   * Check if we should use mock data (development mode or for mock players)
   */
  shouldUseMockData(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true';
  },

  /**
   * Check if this is a mock player that should use mock data (works in production)
   */
  isMockPlayer(playerName: string): boolean {
    const lowerName = playerName.toLowerCase();
    return lowerName.includes('mock') || 
           lowerName === 'mock player' ||
           lowerName === 'mock receiver' ||
           lowerName === 'mock runner';
  }
};
