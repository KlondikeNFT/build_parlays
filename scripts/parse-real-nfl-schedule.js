const fs = require('fs');
const path = require('path');

function parseRealNFLSchedule() {
  console.log('🏈 Parsing real NFL 2025 schedule data...');
  
  const scheduleText = `WEEK 1
Thursday, Sept. 4, 2025
Dallas Cowboys at Philadelphia Eagles
8:20p (ET)
8:20p
NBC
Friday, Sept. 5, 2025
Kansas City Chiefs vs Los Angeles Chargers (Sao Paulo)
9:00p (BRT)
8:00p
YouTube
Sunday, Sept. 07, 2025
Tampa Bay Buccaneers at Atlanta Falcons
1:00p (ET)
1:00p
FOX
Cincinnati Bengals at Cleveland Browns
1:00p (ET)
1:00p
FOX
Miami Dolphins at Indianapolis Colts
1:00p (ET)
1:00p
CBS
Carolina Panthers at Jacksonville Jaguars
1:00p (ET)
1:00p
FOX
Las Vegas Raiders at New England Patriots
1:00p (ET)
1:00p
CBS
Arizona Cardinals at New Orleans Saints
12:00p (CT)
1:00p
CBS
Pittsburgh Steelers at New York Jets
1:00p (ET)
1:00p
CBS
New York Giants at Washington Commanders
1:00p (ET)
1:00p
FOX
Tennessee Titans at Denver Broncos
2:05p (MT)
4:05p
FOX
San Francisco 49ers at Seattle Seahawks
1:05p (PT)
4:05p
FOX
Detroit Lions at Green Bay Packers
3:25p (CT)
4:25p
CBS
Houston Texans at Los Angeles Rams
1:25p (PT)
4:25p
CBS
Baltimore Ravens at Buffalo Bills
8:20p (ET)
8:20p
NBC
Monday, Sept. 8, 2025
Minnesota Vikings at Chicago Bears 
7:15p (CT)
8:15p
ABC/ESPN`;

  const games = [];
  const lines = scheduleText.split('\n');
  
  let currentWeek = 0;
  let currentDate = '';
  let currentDay = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('WEEK ')) {
      currentWeek = parseInt(line.replace('WEEK ', ''));
      continue;
    }
    
    if (line.includes(', 2025')) {
      // Date line like "Thursday, Sept. 4, 2025"
      const parts = line.split(', ');
      currentDay = parts[0];
      currentDate = parts[1] + ', 2025';
      continue;
    }
    
    if (line.includes(' at ') || line.includes(' vs ')) {
      // Game line
      const gameData = parseGameLine(line, currentWeek, currentDate, currentDay, lines, i, games);
      if (gameData) {
        games.push(gameData);
      }
    }
  }
  
  console.log(`✅ Parsed ${games.length} games from real NFL schedule`);
  return games;
}

function parseGameLine(gameLine, week, date, day, allLines, lineIndex, games) {
  // Extract teams
  let awayTeam, homeTeam;
  if (gameLine.includes(' at ')) {
    [awayTeam, homeTeam] = gameLine.split(' at ');
  } else if (gameLine.includes(' vs ')) {
    [awayTeam, homeTeam] = gameLine.split(' vs ');
  } else {
    return null;
  }
  
  // Clean up team names (remove location info in parentheses)
  awayTeam = awayTeam.replace(/\s*\([^)]*\)$/, '').trim();
  homeTeam = homeTeam.replace(/\s*\([^)]*\)$/, '').trim();
  
  // Get time and broadcast from next lines
  let time = '';
  let broadcast = '';
  
  for (let i = lineIndex + 1; i < Math.min(lineIndex + 4, allLines.length); i++) {
    const nextLine = allLines[i].trim();
    if (nextLine && !nextLine.includes(' at ') && !nextLine.includes(' vs ') && !nextLine.includes(', 2025')) {
      if (nextLine.includes('p') || nextLine.includes('a') || nextLine.includes(':')) {
        time = nextLine;
      } else if (nextLine.match(/^[A-Z][A-Z0-9\/\s]+$/)) {
        broadcast = nextLine;
        break;
      }
    }
  }
  
  // Convert date to proper format
  const gameDate = convertDateToISO(date);
  
  return {
    game_id: `2025-${week}-${games.length + 1}`,
    season: 2025,
    week: week,
    game_date: gameDate,
    game_time: time,
    home_team_name: homeTeam,
    away_team_name: awayTeam,
    home_team_abbr: getTeamAbbr(homeTeam),
    away_team_abbr: getTeamAbbr(awayTeam),
    broadcast_primary: broadcast,
    game_type: getGameType(day),
    venue_name: getVenueName(homeTeam),
    venue_city: getVenueCity(homeTeam),
    venue_state: getVenueState(homeTeam),
    status: 'scheduled',
    created_at: new Date().toISOString()
  };
}

function convertDateToISO(dateStr) {
  // Convert "Sept. 4, 2025" to "2025-09-04"
  const months = {
    'Jan.': '01', 'Feb.': '02', 'Mar.': '03', 'Apr.': '04',
    'May': '05', 'Jun.': '06', 'Jul.': '07', 'Aug.': '08',
    'Sept.': '09', 'Oct.': '10', 'Nov.': '11', 'Dec.': '12'
  };
  
  const parts = dateStr.split(' ');
  const month = months[parts[0]];
  const day = parts[1].replace(',', '').padStart(2, '0');
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
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
    'Washington Commanders': 'FedExField'
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
    'Washington Commanders': 'Landover'
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
    'Washington Commanders': 'MD'
  };
  
  return states[teamName] || 'Unknown';
}

if (require.main === module) {
  const games = parseRealNFLSchedule();
  
  // Save to file
  const outputPath = path.join(__dirname, '..', 'data', 'nfl-2025-real-schedule-parsed.json');
  fs.writeFileSync(outputPath, JSON.stringify(games, null, 2));
  console.log(`💾 Saved parsed schedule to: ${outputPath}`);
  
  // Show sample
  console.log('📅 Sample games:');
  games.slice(0, 5).forEach((game, index) => {
    console.log(`  ${index + 1}. Week ${game.week}: ${game.away_team_name} @ ${game.home_team_name} (${game.game_date})`);
  });
}

module.exports = { parseRealNFLSchedule };
