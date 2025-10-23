const fs = require('fs');
const path = require('path');

/**
 * Create a comprehensive mock NFL 2025 schedule
 * This will give us realistic data to work with while we figure out the ESPN API
 */

function createMockNFLSchedule() {
  console.log('🏈 Creating comprehensive mock NFL 2025 schedule...');
  
  // NFL teams with realistic data
  const teams = [
    { id: '1', name: 'Arizona Cardinals', abbr: 'ARI', city: 'Arizona' },
    { id: '2', name: 'Atlanta Falcons', abbr: 'ATL', city: 'Atlanta' },
    { id: '3', name: 'Baltimore Ravens', abbr: 'BAL', city: 'Baltimore' },
    { id: '4', name: 'Buffalo Bills', abbr: 'BUF', city: 'Buffalo' },
    { id: '5', name: 'Carolina Panthers', abbr: 'CAR', city: 'Carolina' },
    { id: '6', name: 'Chicago Bears', abbr: 'CHI', city: 'Chicago' },
    { id: '7', name: 'Cincinnati Bengals', abbr: 'CIN', city: 'Cincinnati' },
    { id: '8', name: 'Cleveland Browns', abbr: 'CLE', city: 'Cleveland' },
    { id: '9', name: 'Dallas Cowboys', abbr: 'DAL', city: 'Dallas' },
    { id: '10', name: 'Denver Broncos', abbr: 'DEN', city: 'Denver' },
    { id: '11', name: 'Detroit Lions', abbr: 'DET', city: 'Detroit' },
    { id: '12', name: 'Green Bay Packers', abbr: 'GB', city: 'Green Bay' },
    { id: '13', name: 'Houston Texans', abbr: 'HOU', city: 'Houston' },
    { id: '14', name: 'Indianapolis Colts', abbr: 'IND', city: 'Indianapolis' },
    { id: '15', name: 'Jacksonville Jaguars', abbr: 'JAX', city: 'Jacksonville' },
    { id: '16', name: 'Kansas City Chiefs', abbr: 'KC', city: 'Kansas City' },
    { id: '17', name: 'Las Vegas Raiders', abbr: 'LV', city: 'Las Vegas' },
    { id: '18', name: 'Los Angeles Chargers', abbr: 'LAC', city: 'Los Angeles' },
    { id: '19', name: 'Los Angeles Rams', abbr: 'LAR', city: 'Los Angeles' },
    { id: '20', name: 'Miami Dolphins', abbr: 'MIA', city: 'Miami' },
    { id: '21', name: 'Minnesota Vikings', abbr: 'MIN', city: 'Minneapolis' },
    { id: '22', name: 'New England Patriots', abbr: 'NE', city: 'New England' },
    { id: '23', name: 'New Orleans Saints', abbr: 'NO', city: 'New Orleans' },
    { id: '24', name: 'New York Giants', abbr: 'NYG', city: 'New York' },
    { id: '25', name: 'New York Jets', abbr: 'NYJ', city: 'New York' },
    { id: '26', name: 'Philadelphia Eagles', abbr: 'PHI', city: 'Philadelphia' },
    { id: '27', name: 'Pittsburgh Steelers', abbr: 'PIT', city: 'Pittsburgh' },
    { id: '28', name: 'San Francisco 49ers', abbr: 'SF', city: 'San Francisco' },
    { id: '29', name: 'Seattle Seahawks', abbr: 'SEA', city: 'Seattle' },
    { id: '30', name: 'Tampa Bay Buccaneers', abbr: 'TB', city: 'Tampa Bay' },
    { id: '31', name: 'Tennessee Titans', abbr: 'TEN', city: 'Tennessee' },
    { id: '32', name: 'Washington Commanders', abbr: 'WAS', city: 'Washington' }
  ];
  
  // Venues with realistic data
  const venues = [
    { name: 'State Farm Stadium', city: 'Glendale', state: 'AZ', capacity: 63400, indoor: true },
    { name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', capacity: 71000, indoor: true },
    { name: 'M&T Bank Stadium', city: 'Baltimore', state: 'MD', capacity: 71008, indoor: false },
    { name: 'Highmark Stadium', city: 'Orchard Park', state: 'NY', capacity: 71608, indoor: false },
    { name: 'Bank of America Stadium', city: 'Charlotte', state: 'NC', capacity: 75523, indoor: false },
    { name: 'Soldier Field', city: 'Chicago', state: 'IL', capacity: 61500, indoor: false },
    { name: 'Paycor Stadium', city: 'Cincinnati', state: 'OH', capacity: 65515, indoor: false },
    { name: 'FirstEnergy Stadium', city: 'Cleveland', state: 'OH', capacity: 67895, indoor: false },
    { name: 'AT&T Stadium', city: 'Arlington', state: 'TX', capacity: 80000, indoor: true },
    { name: 'Empower Field at Mile High', city: 'Denver', state: 'CO', capacity: 76125, indoor: false },
    { name: 'Ford Field', city: 'Detroit', state: 'MI', capacity: 65000, indoor: true },
    { name: 'Lambeau Field', city: 'Green Bay', state: 'WI', capacity: 81441, indoor: false },
    { name: 'NRG Stadium', city: 'Houston', state: 'TX', capacity: 72220, indoor: true },
    { name: 'Lucas Oil Stadium', city: 'Indianapolis', state: 'IN', capacity: 67000, indoor: true },
    { name: 'TIAA Bank Field', city: 'Jacksonville', state: 'FL', capacity: 69132, indoor: false },
    { name: 'Arrowhead Stadium', city: 'Kansas City', state: 'MO', capacity: 76416, indoor: false },
    { name: 'Allegiant Stadium', city: 'Las Vegas', state: 'NV', capacity: 65000, indoor: true },
    { name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', capacity: 70240, indoor: true },
    { name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', capacity: 70240, indoor: true },
    { name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', capacity: 65326, indoor: false },
    { name: 'U.S. Bank Stadium', city: 'Minneapolis', state: 'MN', capacity: 66655, indoor: true },
    { name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', capacity: 65878, indoor: false },
    { name: 'Caesars Superdome', city: 'New Orleans', state: 'LA', capacity: 73208, indoor: true },
    { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', capacity: 82500, indoor: false },
    { name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', capacity: 82500, indoor: false },
    { name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', capacity: 69796, indoor: false },
    { name: 'Heinz Field', city: 'Pittsburgh', state: 'PA', capacity: 68400, indoor: false },
    { name: 'Levi\'s Stadium', city: 'Santa Clara', state: 'CA', capacity: 68500, indoor: false },
    { name: 'Lumen Field', city: 'Seattle', state: 'WA', capacity: 68000, indoor: false },
    { name: 'Raymond James Stadium', city: 'Tampa', state: 'FL', capacity: 65890, indoor: false },
    { name: 'Nissan Stadium', city: 'Nashville', state: 'TN', capacity: 69143, indoor: false },
    { name: 'FedExField', city: 'Landover', state: 'MD', capacity: 82000, indoor: false }
  ];
  
  // Broadcast networks
  const networks = [
    'CBS', 'FOX', 'NBC', 'ESPN', 'ABC', 'Amazon Prime', 'NFL Network', 'TNT'
  ];
  
  // Weather conditions
  const weatherConditions = [
    'Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Snow', 'Windy', 'Clear'
  ];
  
  const games = [];
  let gameId = 1;
  
  // Create games for weeks 1-18 (regular season)
  for (let week = 1; week <= 18; week++) {
    console.log(`📅 Creating games for Week ${week}...`);
    
    // Create 16 games per week (32 teams / 2)
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 16; i++) {
      const homeTeam = shuffledTeams[i * 2];
      const awayTeam = shuffledTeams[i * 2 + 1];
      const venue = venues[Math.floor(Math.random() * venues.length)];
      const network = networks[Math.floor(Math.random() * networks.length)];
      const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      
      // Create realistic game dates
      const gameDate = new Date(2025, 8, 7 + (week - 1) * 7); // Start September 7, 2025
      const gameTime = new Date(gameDate);
      gameTime.setHours(13 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 4) * 15, 0, 0);
      
      const game = {
        game_id: `2025-${week.toString().padStart(2, '0')}-${gameId.toString().padStart(3, '0')}`,
        season: 2025,
        week: week,
        game_date: gameTime.toISOString(),
        game_time: gameTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        home_team_id: homeTeam.id,
        home_team_name: homeTeam.name,
        home_team_abbr: homeTeam.abbr,
        home_score: week <= 7 ? Math.floor(Math.random() * 35) : null, // Some games have scores if they're in the past
        away_team_id: awayTeam.id,
        away_team_name: awayTeam.name,
        away_team_abbr: awayTeam.abbr,
        away_score: week <= 7 ? Math.floor(Math.random() * 35) : null,
        venue: {
          name: venue.name,
          city: venue.city,
          state: venue.state,
          capacity: venue.capacity,
          indoor: venue.indoor
        },
        broadcast: {
          primary: network,
          all: network,
          networks: [network],
          details: [{ network, type: 'TV', language: 'English', full: network }]
        },
        status: week <= 7 ? 'final' : 'scheduled',
        game_type: 'regular',
        weather: {
          temperature: Math.floor(Math.random() * 40) + 30, // 30-70°F
          condition: weather,
          humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
          wind_speed: Math.floor(Math.random() * 15), // 0-15 mph
          wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]
        },
        created_at: new Date().toISOString()
      };
      
      games.push(game);
      gameId++;
    }
  }
  
  // Add some playoff games
  console.log('🏆 Creating playoff games...');
  const playoffWeeks = [19, 20, 21, 22]; // Wild Card, Divisional, Conference, Super Bowl
  const playoffNames = ['Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl'];
  
  for (let i = 0; i < playoffWeeks.length; i++) {
    const week = playoffWeeks[i];
    const gameName = playoffNames[i];
    const numGames = i === 3 ? 1 : Math.pow(2, 3 - i); // Super Bowl = 1, Conference = 2, etc.
    
    for (let j = 0; j < numGames; j++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      const awayTeam = teams[Math.floor(Math.random() * teams.length)];
      const venue = venues[Math.floor(Math.random() * venues.length)];
      
      const gameDate = new Date(2025, 11, 7 + (week - 19) * 7); // Start January 7, 2026
      const gameTime = new Date(gameDate);
      gameTime.setHours(15 + Math.floor(Math.random() * 4), 0, 0, 0);
      
      const game = {
        game_id: `2025-${week.toString().padStart(2, '0')}-${gameId.toString().padStart(3, '0')}`,
        season: 2025,
        week: week,
        game_date: gameTime.toISOString(),
        game_time: gameTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZoneName: 'short'
        }),
        home_team_id: homeTeam.id,
        home_team_name: homeTeam.name,
        home_team_abbr: homeTeam.abbr,
        home_score: null,
        away_team_id: awayTeam.id,
        away_team_name: awayTeam.name,
        away_team_abbr: awayTeam.abbr,
        away_score: null,
        venue: {
          name: venue.name,
          city: venue.city,
          state: venue.state,
          capacity: venue.capacity,
          indoor: venue.indoor
        },
        broadcast: {
          primary: 'CBS',
          all: 'CBS',
          networks: ['CBS'],
          details: [{ network: 'CBS', type: 'TV', language: 'English', full: 'CBS' }]
        },
        status: 'scheduled',
        game_type: 'playoffs',
        weather: {
          temperature: Math.floor(Math.random() * 30) + 20, // 20-50°F
          condition: 'Clear',
          humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
          wind_speed: Math.floor(Math.random() * 10), // 0-10 mph
          wind_direction: 'N'
        },
        created_at: new Date().toISOString()
      };
      
      games.push(game);
      gameId++;
    }
  }
  
  // Sort games by date
  games.sort((a, b) => new Date(a.game_date) - new Date(b.game_date));
  
  console.log(`🎉 Created ${games.length} total games for 2025 season`);
  console.log(`📊 Regular season: ${games.filter(g => g.game_type === 'regular').length} games`);
  console.log(`🏆 Playoffs: ${games.filter(g => g.game_type === 'playoffs').length} games`);
  
  // Save to JSON file
  const outputPath = path.join(__dirname, '..', 'data', 'nfl-2025-schedule.json');
  fs.writeFileSync(outputPath, JSON.stringify(games, null, 2));
  console.log(`💾 Saved schedule to ${outputPath}`);
  
  // Show some sample games
  console.log('📅 Sample games:');
  games.slice(0, 5).forEach(game => {
    const date = new Date(game.game_date).toLocaleDateString();
    console.log(`  - Week ${game.week}: ${game.away_team_name} @ ${game.home_team_name} (${date})`);
  });
  
  return games;
}

// Run the script
if (require.main === module) {
  createMockNFLSchedule();
}

module.exports = { createMockNFLSchedule };




