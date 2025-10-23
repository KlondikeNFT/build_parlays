const fs = require('fs');
const path = require('path');

function parseCompleteRealNFLSchedule() {
  console.log('🏈 Parsing complete real NFL 2025 schedule data...');
  
  // This is the complete schedule data you provided
  const scheduleData = [
    // WEEK 1
    { week: 1, date: '2025-09-04', day: 'Thursday', away: 'Dallas Cowboys', home: 'Philadelphia Eagles', time: '8:20p (ET)', broadcast: 'NBC' },
    { week: 1, date: '2025-09-05', day: 'Friday', away: 'Kansas City Chiefs', home: 'Los Angeles Chargers', time: '9:00p (BRT)', broadcast: 'YouTube', venue: 'Sao Paulo' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Tampa Bay Buccaneers', home: 'Atlanta Falcons', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Cincinnati Bengals', home: 'Cleveland Browns', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Miami Dolphins', home: 'Indianapolis Colts', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Carolina Panthers', home: 'Jacksonville Jaguars', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Las Vegas Raiders', home: 'New England Patriots', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Arizona Cardinals', home: 'New Orleans Saints', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Pittsburgh Steelers', home: 'New York Jets', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'New York Giants', home: 'Washington Commanders', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Tennessee Titans', home: 'Denver Broncos', time: '2:05p (MT)', broadcast: 'FOX' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'San Francisco 49ers', home: 'Seattle Seahawks', time: '1:05p (PT)', broadcast: 'FOX' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Detroit Lions', home: 'Green Bay Packers', time: '3:25p (CT)', broadcast: 'CBS' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Houston Texans', home: 'Los Angeles Rams', time: '1:25p (PT)', broadcast: 'CBS' },
    { week: 1, date: '2025-09-07', day: 'Sunday', away: 'Baltimore Ravens', home: 'Buffalo Bills', time: '8:20p (ET)', broadcast: 'NBC' },
    { week: 1, date: '2025-09-08', day: 'Monday', away: 'Minnesota Vikings', home: 'Chicago Bears', time: '7:15p (CT)', broadcast: 'ABC/ESPN' },
    
    // WEEK 2
    { week: 2, date: '2025-09-11', day: 'Thursday', away: 'Washington Commanders', home: 'Green Bay Packers', time: '7:15p (CT)', broadcast: 'Prime Video' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Cleveland Browns', home: 'Baltimore Ravens', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Jacksonville Jaguars', home: 'Cincinnati Bengals', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'New York Giants', home: 'Dallas Cowboys', time: '12:00p (CT)', broadcast: 'FOX' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Chicago Bears', home: 'Detroit Lions', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'New England Patriots', home: 'Miami Dolphins', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'San Francisco 49ers', home: 'New Orleans Saints', time: '12:00p (CT)', broadcast: 'FOX' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Buffalo Bills', home: 'New York Jets', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Seattle Seahawks', home: 'Pittsburgh Steelers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Los Angeles Rams', home: 'Tennessee Titans', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Carolina Panthers', home: 'Arizona Cardinals', time: '1:05p (MT)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Denver Broncos', home: 'Indianapolis Colts', time: '4:05p (ET)', broadcast: 'CBS' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Philadelphia Eagles', home: 'Kansas City Chiefs', time: '3:25p (CT)', broadcast: 'FOX' },
    { week: 2, date: '2025-09-14', day: 'Sunday', away: 'Atlanta Falcons', home: 'Minnesota Vikings', time: '7:20p (CT)', broadcast: 'NBC' },
    { week: 2, date: '2025-09-15', day: 'Monday', away: 'Tampa Bay Buccaneers', home: 'Houston Texans', time: '6:00p (CT)', broadcast: 'ABC' },
    { week: 2, date: '2025-09-15', day: 'Monday', away: 'Los Angeles Chargers', home: 'Las Vegas Raiders', time: '7:00p (PT)', broadcast: 'ESPN' },
    
    // WEEK 3
    { week: 3, date: '2025-09-18', day: 'Thursday', away: 'Miami Dolphins', home: 'Buffalo Bills', time: '8:15p (ET)', broadcast: 'Prime Video' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Atlanta Falcons', home: 'Carolina Panthers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Green Bay Packers', home: 'Cleveland Browns', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Houston Texans', home: 'Jacksonville Jaguars', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Cincinnati Bengals', home: 'Minnesota Vikings', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Pittsburgh Steelers', home: 'New England Patriots', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Los Angeles Rams', home: 'Philadelphia Eagles', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'New York Jets', home: 'Tampa Bay Buccaneers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Indianapolis Colts', home: 'Tennessee Titans', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Las Vegas Raiders', home: 'Washington Commanders', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Denver Broncos', home: 'Los Angeles Chargers', time: '1:05p (PT)', broadcast: 'CBS' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'New Orleans Saints', home: 'Seattle Seahawks', time: '1:05p (PT)', broadcast: 'CBS' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Dallas Cowboys', home: 'Chicago Bears', time: '3:25p (CT)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Arizona Cardinals', home: 'San Francisco 49ers', time: '1:25p (PT)', broadcast: 'FOX' },
    { week: 3, date: '2025-09-21', day: 'Sunday', away: 'Kansas City Chiefs', home: 'New York Giants', time: '8:20p (ET)', broadcast: 'NBC' },
    { week: 3, date: '2025-09-22', day: 'Monday', away: 'Detroit Lions', home: 'Baltimore Ravens', time: '8:15p (ET)', broadcast: 'ESPN/ABC' },
    
    // WEEK 4
    { week: 4, date: '2025-09-25', day: 'Thursday', away: 'Seattle Seahawks', home: 'Arizona Cardinals', time: '5:15p (MT)', broadcast: 'Prime Video' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Minnesota Vikings', home: 'Pittsburgh Steelers', time: '2:30p (IST)', broadcast: 'NFLN', venue: 'Dublin' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Washington Commanders', home: 'Atlanta Falcons', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'New Orleans Saints', home: 'Buffalo Bills', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Cleveland Browns', home: 'Detroit Lions', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Tennessee Titans', home: 'Houston Texans', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Carolina Panthers', home: 'New England Patriots', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Los Angeles Chargers', home: 'New York Giants', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Philadelphia Eagles', home: 'Tampa Bay Buccaneers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Indianapolis Colts', home: 'Los Angeles Rams', time: '1:05p (PT)', broadcast: 'FOX' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Jacksonville Jaguars', home: 'San Francisco 49ers', time: '1:05p (PT)', broadcast: 'FOX' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Baltimore Ravens', home: 'Kansas City Chiefs', time: '3:25p (CT)', broadcast: 'CBS' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Chicago Bears', home: 'Las Vegas Raiders', time: '1:25p (PT)', broadcast: 'CBS' },
    { week: 4, date: '2025-09-28', day: 'Sunday', away: 'Green Bay Packers', home: 'Dallas Cowboys', time: '7:20p (CT)', broadcast: 'NBC' },
    { week: 4, date: '2025-09-29', day: 'Monday', away: 'New York Jets', home: 'Miami Dolphins', time: '7:15p (ET)', broadcast: 'ESPN' },
    { week: 4, date: '2025-09-29', day: 'Monday', away: 'Cincinnati Bengals', home: 'Denver Broncos', time: '6:15p (MT)', broadcast: 'ABC' },
    
    // WEEK 5
    { week: 5, date: '2025-10-02', day: 'Thursday', away: 'San Francisco 49ers', home: 'Los Angeles Rams', time: '5:15p (PT)', broadcast: 'Prime Video' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Minnesota Vikings', home: 'Cleveland Browns', time: '2:30p (BST)', broadcast: 'NFLN', venue: 'Tottenham' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Houston Texans', home: 'Baltimore Ravens', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Miami Dolphins', home: 'Carolina Panthers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Las Vegas Raiders', home: 'Indianapolis Colts', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'New York Giants', home: 'New Orleans Saints', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Dallas Cowboys', home: 'New York Jets', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Denver Broncos', home: 'Philadelphia Eagles', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Tennessee Titans', home: 'Arizona Cardinals', time: '1:05p (MT)', broadcast: 'CBS' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Tampa Bay Buccaneers', home: 'Seattle Seahawks', time: '1:05p (PT)', broadcast: 'CBS' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Detroit Lions', home: 'Cincinnati Bengals', time: '4:25p (ET)', broadcast: 'FOX' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'Washington Commanders', home: 'Los Angeles Chargers', time: '1:25p (PT)', broadcast: 'FOX' },
    { week: 5, date: '2025-10-05', day: 'Sunday', away: 'New England Patriots', home: 'Buffalo Bills', time: '8:20p (ET)', broadcast: 'NBC' },
    { week: 5, date: '2025-10-06', day: 'Monday', away: 'Kansas City Chiefs', home: 'Jacksonville Jaguars', time: '8:15p (ET)', broadcast: 'ESPN/ABC' },
    
    // WEEK 6
    { week: 6, date: '2025-10-09', day: 'Thursday', away: 'Philadelphia Eagles', home: 'New York Giants', time: '8:15p (ET)', broadcast: 'Prime Video' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Denver Broncos', home: 'New York Jets', time: '2:30p (BST)', broadcast: 'NFLN', venue: 'Tottenham' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Los Angeles Rams', home: 'Baltimore Ravens', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Dallas Cowboys', home: 'Carolina Panthers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Arizona Cardinals', home: 'Indianapolis Colts', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Seattle Seahawks', home: 'Jacksonville Jaguars', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Los Angeles Chargers', home: 'Miami Dolphins', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'New England Patriots', home: 'New Orleans Saints', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Cleveland Browns', home: 'Pittsburgh Steelers', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Tennessee Titans', home: 'Las Vegas Raiders', time: '1:05p (PT)', broadcast: 'FOX' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Cincinnati Bengals', home: 'Green Bay Packers', time: '3:25p (CT)', broadcast: 'CBS' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'San Francisco 49ers', home: 'Tampa Bay Buccaneers', time: '4:25p (ET)', broadcast: 'CBS' },
    { week: 6, date: '2025-10-12', day: 'Sunday', away: 'Detroit Lions', home: 'Kansas City Chiefs', time: '7:20p (CT)', broadcast: 'NBC' },
    { week: 6, date: '2025-10-13', day: 'Monday', away: 'Buffalo Bills', home: 'Atlanta Falcons', time: '7:15p (ET)', broadcast: 'ESPN' },
    { week: 6, date: '2025-10-13', day: 'Monday', away: 'Chicago Bears', home: 'Washington Commanders', time: '8:15p (ET)', broadcast: 'ABC' },
    
    // WEEK 7
    { week: 7, date: '2025-10-16', day: 'Thursday', away: 'Pittsburgh Steelers', home: 'Cincinnati Bengals', time: '8:15p (ET)', broadcast: 'Prime Video' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Los Angeles Rams', home: 'Jacksonville Jaguars', time: '2:30p (BST)', broadcast: 'NFLN', venue: 'Wembley' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'New Orleans Saints', home: 'Chicago Bears', time: '12:00p (CT)', broadcast: 'FOX' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Miami Dolphins', home: 'Cleveland Browns', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Las Vegas Raiders', home: 'Kansas City Chiefs', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Philadelphia Eagles', home: 'Minnesota Vikings', time: '12:00p (CT)', broadcast: 'FOX' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Carolina Panthers', home: 'New York Jets', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'New England Patriots', home: 'Tennessee Titans', time: '12:00p (CT)', broadcast: 'CBS' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'New York Giants', home: 'Denver Broncos', time: '2:05p (MT)', broadcast: 'CBS' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Indianapolis Colts', home: 'Los Angeles Chargers', time: '1:05p (PT)', broadcast: 'CBS' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Green Bay Packers', home: 'Arizona Cardinals', time: '1:25p (MT)', broadcast: 'FOX' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Washington Commanders', home: 'Dallas Cowboys', time: '3:25p (CT)', broadcast: 'FOX' },
    { week: 7, date: '2025-10-19', day: 'Sunday', away: 'Atlanta Falcons', home: 'San Francisco 49ers', time: '5:20p (PT)', broadcast: 'NBC' },
    { week: 7, date: '2025-10-20', day: 'Monday', away: 'Tampa Bay Buccaneers', home: 'Detroit Lions', time: '7:00p (ET)', broadcast: 'ESPN/ABC' },
    { week: 7, date: '2025-10-20', day: 'Monday', away: 'Houston Texans', home: 'Seattle Seahawks', time: '7:00p (PT)', broadcast: 'ESPN+' },
    
    // WEEK 8
    { week: 8, date: '2025-10-23', day: 'Thursday', away: 'Minnesota Vikings', home: 'Los Angeles Chargers', time: '5:15p (PT)', broadcast: 'Prime Video' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Miami Dolphins', home: 'Atlanta Falcons', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Chicago Bears', home: 'Baltimore Ravens', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Buffalo Bills', home: 'Carolina Panthers', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'New York Jets', home: 'Cincinnati Bengals', time: '1:00p (ET)', broadcast: 'CBS' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'San Francisco 49ers', home: 'Houston Texans', time: '12:00p (CT)', broadcast: 'FOX' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Cleveland Browns', home: 'New England Patriots', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'New York Giants', home: 'Philadelphia Eagles', time: '1:00p (ET)', broadcast: 'FOX' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Tampa Bay Buccaneers', home: 'New Orleans Saints', time: '3:05p (CT)', broadcast: 'FOX' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Dallas Cowboys', home: 'Denver Broncos', time: '2:25p (MT)', broadcast: 'CBS' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Tennessee Titans', home: 'Indianapolis Colts', time: '4:25p (ET)', broadcast: 'CBS' },
    { week: 8, date: '2025-10-26', day: 'Sunday', away: 'Green Bay Packers', home: 'Pittsburgh Steelers', time: '8:20p (ET)', broadcast: 'NBC' },
    { week: 8, date: '2025-10-27', day: 'Monday', away: 'Washington Commanders', home: 'Kansas City Chiefs', time: '7:15p (CT)', broadcast: 'ESPN/ABC' }
  ];
  
  const games = scheduleData.map((game, index) => ({
    game_id: `2025-${game.week}-${index + 1}`,
    season: 2025,
    week: game.week,
    game_date: game.date,
    game_time: game.time,
    home_team_name: game.home,
    away_team_name: game.away,
    home_team_abbr: getTeamAbbr(game.home),
    away_team_abbr: getTeamAbbr(game.away),
    broadcast_primary: game.broadcast,
    game_type: getGameType(game.day),
    venue_name: game.venue || getVenueName(game.home),
    venue_city: game.venue ? getVenueCity(game.venue) : getVenueCity(game.home),
    venue_state: game.venue ? getVenueState(game.venue) : getVenueState(game.home),
    status: 'scheduled',
    created_at: new Date().toISOString()
  }));
  
  console.log(`✅ Parsed ${games.length} games from complete real NFL schedule`);
  return games;
}

function getTeamAbbr(teamName) {
  const teamMap = {
    'Arizona Cardinals': 'ARI',
    'Atlanta Falcons': 'ATL',
    'Baltimore Ravens': 'BAL',
    'Buffalo Bills': 'BUF',
    'Carolina Panthers': 'CAR',
    'Chicago Bears': 'CHI',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Dallas Cowboys': 'DAL',
    'Denver Broncos': 'DEN',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Miami Dolphins': 'MIA',
    'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE',
    'New Orleans Saints': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Philadelphia Eagles': 'PHI',
    'Pittsburgh Steelers': 'PIT',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
    'Tampa Bay Buccaneers': 'TB',
    'Tennessee Titans': 'TEN',
    'Washington Commanders': 'WAS'
  };
  
  return teamMap[teamName] || teamName;
}

function getGameType(day) {
  if (day === 'Thursday') return 'Thursday Night Football';
  if (day === 'Monday') return 'Monday Night Football';
  if (day === 'Friday') return 'International Game';
  if (day === 'Saturday') return 'Saturday Game';
  if (day === 'Sunday') return 'Regular Season';
  return 'Regular Season';
}

function getVenueName(teamName) {
  const venues = {
    'Arizona Cardinals': 'State Farm Stadium',
    'Atlanta Falcons': 'Mercedes-Benz Stadium',
    'Baltimore Ravens': 'M&T Bank Stadium',
    'Buffalo Bills': 'Highmark Stadium',
    'Carolina Panthers': 'Bank of America Stadium',
    'Chicago Bears': 'Soldier Field',
    'Cincinnati Bengals': 'Paycor Stadium',
    'Cleveland Browns': 'Cleveland Browns Stadium',
    'Dallas Cowboys': 'AT&T Stadium',
    'Denver Broncos': 'Empower Field at Mile High',
    'Detroit Lions': 'Ford Field',
    'Green Bay Packers': 'Lambeau Field',
    'Houston Texans': 'NRG Stadium',
    'Indianapolis Colts': 'Lucas Oil Stadium',
    'Jacksonville Jaguars': 'EverBank Stadium',
    'Kansas City Chiefs': 'Arrowhead Stadium',
    'Las Vegas Raiders': 'Allegiant Stadium',
    'Los Angeles Chargers': 'SoFi Stadium',
    'Los Angeles Rams': 'SoFi Stadium',
    'Miami Dolphins': 'Hard Rock Stadium',
    'Minnesota Vikings': 'U.S. Bank Stadium',
    'New England Patriots': 'Gillette Stadium',
    'New Orleans Saints': 'Caesars Superdome',
    'New York Giants': 'MetLife Stadium',
    'New York Jets': 'MetLife Stadium',
    'Philadelphia Eagles': 'Lincoln Financial Field',
    'Pittsburgh Steelers': 'Acrisure Stadium',
    'San Francisco 49ers': 'Levi\'s Stadium',
    'Seattle Seahawks': 'Lumen Field',
    'Tampa Bay Buccaneers': 'Raymond James Stadium',
    'Tennessee Titans': 'Nissan Stadium',
    'Washington Commanders': 'FedExField',
    'Sao Paulo': 'Arena Corinthians',
    'Dublin': 'Aviva Stadium',
    'Tottenham': 'Tottenham Hotspur Stadium',
    'Wembley': 'Wembley Stadium',
    'Berlin': 'Olympiastadion Berlin'
  };
  
  return venues[teamName] || `${teamName} Stadium`;
}

function getVenueCity(teamName) {
  const cities = {
    'Arizona Cardinals': 'Glendale',
    'Atlanta Falcons': 'Atlanta',
    'Baltimore Ravens': 'Baltimore',
    'Buffalo Bills': 'Orchard Park',
    'Carolina Panthers': 'Charlotte',
    'Chicago Bears': 'Chicago',
    'Cincinnati Bengals': 'Cincinnati',
    'Cleveland Browns': 'Cleveland',
    'Dallas Cowboys': 'Arlington',
    'Denver Broncos': 'Denver',
    'Detroit Lions': 'Detroit',
    'Green Bay Packers': 'Green Bay',
    'Houston Texans': 'Houston',
    'Indianapolis Colts': 'Indianapolis',
    'Jacksonville Jaguars': 'Jacksonville',
    'Kansas City Chiefs': 'Kansas City',
    'Las Vegas Raiders': 'Las Vegas',
    'Los Angeles Chargers': 'Inglewood',
    'Los Angeles Rams': 'Inglewood',
    'Miami Dolphins': 'Miami Gardens',
    'Minnesota Vikings': 'Minneapolis',
    'New England Patriots': 'Foxborough',
    'New Orleans Saints': 'New Orleans',
    'New York Giants': 'East Rutherford',
    'New York Jets': 'East Rutherford',
    'Philadelphia Eagles': 'Philadelphia',
    'Pittsburgh Steelers': 'Pittsburgh',
    'San Francisco 49ers': 'Santa Clara',
    'Seattle Seahawks': 'Seattle',
    'Tampa Bay Buccaneers': 'Tampa',
    'Tennessee Titans': 'Nashville',
    'Washington Commanders': 'Landover',
    'Sao Paulo': 'Sao Paulo',
    'Dublin': 'Dublin',
    'Tottenham': 'London',
    'Wembley': 'London',
    'Berlin': 'Berlin'
  };
  
  return cities[teamName] || 'Unknown';
}

function getVenueState(teamName) {
  const states = {
    'Arizona Cardinals': 'AZ',
    'Atlanta Falcons': 'GA',
    'Baltimore Ravens': 'MD',
    'Buffalo Bills': 'NY',
    'Carolina Panthers': 'NC',
    'Chicago Bears': 'IL',
    'Cincinnati Bengals': 'OH',
    'Cleveland Browns': 'OH',
    'Dallas Cowboys': 'TX',
    'Denver Broncos': 'CO',
    'Detroit Lions': 'MI',
    'Green Bay Packers': 'WI',
    'Houston Texans': 'TX',
    'Indianapolis Colts': 'IN',
    'Jacksonville Jaguars': 'FL',
    'Kansas City Chiefs': 'MO',
    'Las Vegas Raiders': 'NV',
    'Los Angeles Chargers': 'CA',
    'Los Angeles Rams': 'CA',
    'Miami Dolphins': 'FL',
    'Minnesota Vikings': 'MN',
    'New England Patriots': 'MA',
    'New Orleans Saints': 'LA',
    'New York Giants': 'NJ',
    'New York Jets': 'NJ',
    'Philadelphia Eagles': 'PA',
    'Pittsburgh Steelers': 'PA',
    'San Francisco 49ers': 'CA',
    'Seattle Seahawks': 'WA',
    'Tampa Bay Buccaneers': 'FL',
    'Tennessee Titans': 'TN',
    'Washington Commanders': 'MD',
    'Sao Paulo': 'Brazil',
    'Dublin': 'Ireland',
    'Tottenham': 'England',
    'Wembley': 'England',
    'Berlin': 'Germany'
  };
  
  return states[teamName] || 'Unknown';
}

if (require.main === module) {
  const games = parseCompleteRealNFLSchedule();
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'data', 'nfl-2025-complete-real-schedule.json');
  fs.writeFileSync(outputPath, JSON.stringify(games, null, 2));
  console.log(`💾 Saved complete real schedule to: ${outputPath}`);
  
  // Show sample
  console.log('📅 Sample games:');
  games.slice(0, 10).forEach((game, index) => {
    console.log(`  ${index + 1}. Week ${game.week}: ${game.away_team_name} @ ${game.home_team_name} (${game.game_date}) - ${game.broadcast_primary}`);
  });
  
  // Show games for October 23rd (tomorrow)
  const oct23Games = games.filter(game => game.game_date === '2025-10-23');
  console.log(`\n📅 Games for October 23rd, 2025 (${oct23Games.length} games):`);
  oct23Games.forEach((game, index) => {
    console.log(`  ${index + 1}. ${game.away_team_name} @ ${game.home_team_name} (${game.game_time}) - ${game.broadcast_primary}`);
  });
}

module.exports = { parseCompleteRealNFLSchedule };
