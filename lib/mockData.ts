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
  FirstName: 'Patrick',
  LastName: 'Mahomes',
  Position: 'QB',
  Status: 'Active',
  Height: '6-3',
  Weight: 230,
  BirthDate: '1995-09-17T00:00:00',
  College: 'Texas Tech',
  Experience: 7,
  PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99999.png',
  DepthOrder: 1,
  InjuryStatus: 'Active',
  InjuryBodyPart: '',
  Started: 17
};

// Mock Season Stats for Mock Player
export const MOCK_SEASON_STATS: MockPlayerSeason = {
  PlayerID: 99999,
  Name: 'Patrick Mahomes',
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
    FirstName: 'Travis',
    LastName: 'Kelce',
    Position: 'TE',
    Status: 'Active',
    Height: '6-5',
    Weight: 260,
    BirthDate: '1989-10-05T00:00:00',
    College: 'Cincinnati',
    Experience: 11,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99998.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 15
  },
  {
    PlayerID: 99997,
    Team: 'BUF',
    Number: 17,
    FirstName: 'Josh',
    LastName: 'Allen',
    Position: 'QB',
    Status: 'Active',
    Height: '6-5',
    Weight: 237,
    BirthDate: '1996-05-21T00:00:00',
    College: 'Wyoming',
    Experience: 6,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99997.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 17
  },
  {
    PlayerID: 99996,
    Team: 'BUF',
    Number: 14,
    FirstName: 'Stefon',
    LastName: 'Diggs',
    Position: 'WR',
    Status: 'Active',
    Height: '6-0',
    Weight: 191,
    BirthDate: '1993-11-29T00:00:00',
    College: 'Maryland',
    Experience: 9,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99996.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 17
  },
  {
    PlayerID: 99995,
    Team: 'DAL',
    Number: 4,
    FirstName: 'Dak',
    LastName: 'Prescott',
    Position: 'QB',
    Status: 'Active',
    Height: '6-2',
    Weight: 238,
    BirthDate: '1993-07-29T00:00:00',
    College: 'Mississippi State',
    Experience: 8,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99995.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 17
  },
  {
    PlayerID: 99994,
    Team: 'SF',
    Number: 13,
    FirstName: 'Brock',
    LastName: 'Purdy',
    Position: 'QB',
    Status: 'Active',
    Height: '6-1',
    Weight: 220,
    BirthDate: '1999-12-27T00:00:00',
    College: 'Iowa State',
    Experience: 2,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99994.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 16
  },
  {
    PlayerID: 99993,
    Team: 'BAL',
    Number: 8,
    FirstName: 'Lamar',
    LastName: 'Jackson',
    Position: 'QB',
    Status: 'Active',
    Height: '6-2',
    Weight: 215,
    BirthDate: '1997-01-07T00:00:00',
    College: 'Louisville',
    Experience: 6,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99993.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 16
  },
  {
    PlayerID: 99992,
    Team: 'DET',
    Number: 16,
    FirstName: 'Jared',
    LastName: 'Goff',
    Position: 'QB',
    Status: 'Active',
    Height: '6-4',
    Weight: 217,
    BirthDate: '1994-10-14T00:00:00',
    College: 'California',
    Experience: 8,
    PhotoUrl: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99992.png',
    DepthOrder: 1,
    InjuryStatus: 'Active',
    InjuryBodyPart: '',
    Started: 17
  }
];

export const MOCK_SEARCH_RESULTS = {
  players: MOCK_PLAYERS,
  teams: [
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
      record: '12-5'
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
      record: '11-6'
    },
    {
      TeamID: 3,
      Key: 'DAL',
      City: 'Dallas',
      Name: 'Cowboys',
      FullName: 'Dallas Cowboys',
      StadiumID: 3,
      ByeWeek: 7,
      Conference: 'NFC',
      Division: 'East',
      PrimaryColor: '#003594',
      SecondaryColor: '#869397',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
      wins: 12,
      losses: 5,
      ties: 0,
      record: '12-5'
    },
    {
      TeamID: 4,
      Key: 'SF',
      City: 'San Francisco',
      Name: '49ers',
      FullName: 'San Francisco 49ers',
      StadiumID: 4,
      ByeWeek: 9,
      Conference: 'NFC',
      Division: 'West',
      PrimaryColor: '#AA0000',
      SecondaryColor: '#B3995D',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
      wins: 12,
      losses: 5,
      ties: 0,
      record: '12-5'
    },
    {
      TeamID: 5,
      Key: 'BAL',
      City: 'Baltimore',
      Name: 'Ravens',
      FullName: 'Baltimore Ravens',
      StadiumID: 5,
      ByeWeek: 13,
      Conference: 'AFC',
      Division: 'North',
      PrimaryColor: '#241773',
      SecondaryColor: '#000000',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
      wins: 13,
      losses: 4,
      ties: 0,
      record: '13-4'
    },
    {
      TeamID: 6,
      Key: 'DET',
      City: 'Detroit',
      Name: 'Lions',
      FullName: 'Detroit Lions',
      StadiumID: 6,
      ByeWeek: 9,
      Conference: 'NFC',
      Division: 'North',
      PrimaryColor: '#0076B6',
      SecondaryColor: '#B0B7BC',
      WikipediaLogoUrl: '',
      WikipediaWordMarkUrl: '',
      wins: 12,
      losses: 5,
      ties: 0,
      record: '12-5'
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
    const lowerQuery = query.toLowerCase().trim();
    
    // Enhanced search with fuzzy matching
    const matchingPlayers = MOCK_PLAYERS.filter(player => {
      const fullName = `${player.FirstName} ${player.LastName}`.toLowerCase();
      const firstName = player.FirstName.toLowerCase();
      const lastName = player.LastName.toLowerCase();
      const position = player.Position.toLowerCase();
      const team = player.Team.toLowerCase();
      
      return fullName.includes(lowerQuery) ||
             firstName.includes(lowerQuery) ||
             lastName.includes(lowerQuery) ||
             position.includes(lowerQuery) ||
             team.includes(lowerQuery) ||
             // Fuzzy matching for common misspellings
             (lowerQuery.includes('mahom') && fullName.includes('mahomes')) ||
             (lowerQuery.includes('kelc') && fullName.includes('kelce')) ||
             (lowerQuery.includes('allen') && lastName.includes('allen')) ||
             (lowerQuery.includes('digg') && lastName.includes('diggs')) ||
             (lowerQuery.includes('prescott') && lastName.includes('prescott')) ||
             (lowerQuery.includes('purdy') && lastName.includes('purdy')) ||
             (lowerQuery.includes('jackson') && lastName.includes('jackson')) ||
             (lowerQuery.includes('goff') && lastName.includes('goff'));
    });

    const matchingTeams = MOCK_SEARCH_RESULTS.teams.filter(team => {
      const city = team.City.toLowerCase();
      const name = team.Name.toLowerCase();
      const fullName = team.FullName.toLowerCase();
      const key = team.Key.toLowerCase();
      
      return city.includes(lowerQuery) ||
             name.includes(lowerQuery) ||
             fullName.includes(lowerQuery) ||
             key.includes(lowerQuery) ||
             // Fuzzy matching for common searches
             (lowerQuery.includes('chief') && name.includes('chiefs')) ||
             (lowerQuery.includes('bill') && name.includes('bills')) ||
             (lowerQuery.includes('cowboy') && name.includes('cowboys')) ||
             (lowerQuery.includes('49er') && name.includes('49ers')) ||
             (lowerQuery.includes('raven') && name.includes('ravens')) ||
             (lowerQuery.includes('lion') && name.includes('lions'));
    });

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
  },

  /**
   * Get top players for homepage display
   */
  async getTopPlayers(): Promise<any[]> {
    // Return mock top players data
    return [
      {
        id: '99999',
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        teamAbbr: 'KC',
        image: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99999.png',
        stats: [
          { label: '250+ Passing Yards', threshold: 0, likelihood: 75, confidence: 'high', volatilityWarning: false },
          { label: '2+ Passing TDs', threshold: 0, likelihood: 68, confidence: 'high', volatilityWarning: false },
          { label: '1 or Fewer INT', threshold: 0, likelihood: 72, confidence: 'high', volatilityWarning: false }
        ],
        overallConsistency: 85,
        gamesPlayed: 17,
        isStarter: true,
        injuryStatus: 'Active',
        primaryMetricLabel: 'Pass Yards/Game',
        averagePerGame: 285,
        volatility: 15,
        trend: 'stable'
      },
      {
        id: '99998',
        name: 'Travis Kelce',
        position: 'TE',
        team: 'KC',
        teamAbbr: 'KC',
        image: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99998.png',
        stats: [
          { label: '75+ Receiving Yards', threshold: 0, likelihood: 70, confidence: 'high', volatilityWarning: false },
          { label: '5+ Receptions', threshold: 0, likelihood: 78, confidence: 'high', volatilityWarning: false },
          { label: '1+ Receiving TD', threshold: 0, likelihood: 45, confidence: 'medium', volatilityWarning: true }
        ],
        overallConsistency: 82,
        gamesPlayed: 15,
        isStarter: true,
        injuryStatus: 'Active',
        primaryMetricLabel: 'Rec Yards/Game',
        averagePerGame: 78,
        volatility: 22,
        trend: 'stable'
      },
      {
        id: '99997',
        name: 'Josh Allen',
        position: 'QB',
        team: 'BUF',
        teamAbbr: 'BUF',
        image: 'https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/99997.png',
        stats: [
          { label: '275+ Passing Yards', threshold: 0, likelihood: 65, confidence: 'medium', volatilityWarning: true },
          { label: '2+ Passing TDs', threshold: 0, likelihood: 72, confidence: 'high', volatilityWarning: false },
          { label: '1+ Rushing TD', threshold: 0, likelihood: 35, confidence: 'low', volatilityWarning: true }
        ],
        overallConsistency: 78,
        gamesPlayed: 17,
        isStarter: true,
        injuryStatus: 'Active',
        primaryMetricLabel: 'Pass Yards/Game',
        averagePerGame: 265,
        volatility: 28,
        trend: 'increasing'
      }
    ];
  }
};
