const fs = require('fs');
const path = require('path');

/**
 * Fetch complete NFL 2025 schedule from ESPN API
 * Store in local SQLite and sync to Turso
 */

async function fetchNFLSchedule() {
  try {
    console.log('🏈 Fetching complete NFL 2025 schedule from ESPN...');
    
    // ESPN API endpoint for NFL schedule - use a working endpoint
    const espnUrl = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events';
    
    console.log('📡 Making request to ESPN API...');
    const response = await fetch(espnUrl);
    
    if (!response.ok) {
      throw new Error(`ESPN API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched data from ESPN API`);
    console.log(`📊 Found ${data.count} games`);
    
    // Debug: Log the structure of the first game
    if (data.items && data.items.length > 0) {
      console.log(`🔍 Sample game data:`, JSON.stringify(data.items[0], null, 2));
    }
    
    // Process all games directly from the events endpoint
    const allGames = [];
    
    console.log('📅 Processing all games...');
    
    for (const game of data.items) {
      try {
        // Extract comprehensive game details
        const homeTeam = extractTeamDetails(game.competitions[0].competitors, 'home');
        const awayTeam = extractTeamDetails(game.competitions[0].competitors, 'away');
        
        const gameData = {
          game_id: game.id,
          season: 2025,
          week: extractWeekFromGame(game),
          game_date: game.date,
          game_time: extractGameTime(game.date),
          home_team_id: homeTeam.id,
          home_team_name: homeTeam.name,
          home_team_abbr: homeTeam.abbr,
          home_score: homeTeam.score,
          away_team_id: awayTeam.id,
          away_team_name: awayTeam.name,
          away_team_abbr: awayTeam.abbr,
          away_score: awayTeam.score,
          venue: extractVenue(game.competitions[0].venue),
          broadcast: extractBroadcast(game.competitions[0].broadcasts),
          status: game.status.type.name,
          game_type: extractGameType(game),
          weather: extractWeather(game.competitions[0].weather),
          created_at: new Date().toISOString()
        };
        
        allGames.push(gameData);
        
      } catch (error) {
        console.error(`❌ Error processing game ${game.id}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully fetched ${allGames.length} total games for 2025 season`);
    
    // Sort games by date
    allGames.sort((a, b) => new Date(a.game_date) - new Date(b.game_date));
    
    // Save to JSON file for backup
    const outputPath = path.join(__dirname, '..', 'data', 'nfl-2025-schedule.json');
    fs.writeFileSync(outputPath, JSON.stringify(allGames, null, 2));
    console.log(`💾 Saved schedule to ${outputPath}`);
    
    return allGames;
    
  } catch (error) {
    console.error('❌ Error fetching NFL schedule:', error);
    throw error;
  }
}

function extractWeekFromGame(game) {
  // Try to extract week from game name or other fields
  // This is a simplified approach - you might need to adjust based on ESPN's data structure
  const gameName = game.name || '';
  const weekMatch = gameName.match(/Week (\d+)/i);
  if (weekMatch) {
    return parseInt(weekMatch[1]);
  }
  
  // Fallback: calculate week based on date
  const gameDate = new Date(game.date);
  const seasonStart = new Date('2025-09-01'); // Approximate season start
  const daysDiff = Math.floor((gameDate - seasonStart) / (1000 * 60 * 60 * 24));
  const week = Math.ceil(daysDiff / 7);
  return Math.max(1, Math.min(18, week)); // NFL season is typically 18 weeks
}

function extractTeamDetails(competitors, side) {
  const competitor = competitors.find(c => c.homeAway === side);
  if (!competitor) return { id: null, name: null, abbr: null, score: null };
  
  return {
    id: competitor.team?.id || null,
    name: competitor.team?.displayName || competitor.team?.name || null,
    abbr: competitor.team?.abbreviation || null,
    score: competitor.score ? parseInt(competitor.score) : null
  };
}

function extractGameTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function extractVenue(venue) {
  if (!venue) return null;
  
  return {
    name: venue.fullName || venue.name || null,
    city: venue.address?.city || null,
    state: venue.address?.state || null,
    capacity: venue.capacity || null,
    indoor: venue.indoor || false
  };
}

function extractBroadcast(broadcasts) {
  if (!broadcasts || broadcasts.length === 0) return 'TBD';
  
  const broadcastInfo = broadcasts.map(broadcast => {
    const network = broadcast.names ? broadcast.names.join(', ') : '';
    const type = broadcast.type || '';
    const language = broadcast.language || '';
    
    return {
      network,
      type,
      language,
      full: `${network}${type ? ` (${type})` : ''}${language ? ` - ${language}` : ''}`
    };
  });
  
  return {
    primary: broadcastInfo[0]?.full || 'TBD',
    all: broadcastInfo.map(b => b.full).join(', '),
    networks: broadcastInfo.map(b => b.network).filter(Boolean),
    details: broadcastInfo
  };
}

function extractGameType(game) {
  // Determine if it's regular season, playoffs, etc.
  const gameName = game.name || '';
  
  if (gameName.includes('Wild Card') || gameName.includes('Divisional') || gameName.includes('Conference') || gameName.includes('Super Bowl')) {
    return 'playoffs';
  }
  
  if (gameName.includes('Preseason')) {
    return 'preseason';
  }
  
  return 'regular';
}

function extractWeather(weather) {
  if (!weather) return null;
  
  return {
    temperature: weather.temperature || null,
    condition: weather.displayValue || weather.condition || null,
    humidity: weather.humidity || null,
    wind_speed: weather.windSpeed || null,
    wind_direction: weather.windDirection || null
  };
}

// Run the script
if (require.main === module) {
  fetchNFLSchedule()
    .then(games => {
      console.log(`✅ Successfully fetched ${games.length} games`);
      console.log('📅 Sample games:');
      games.slice(0, 5).forEach(game => {
        console.log(`  - ${game.game_date}: ${game.away_team} @ ${game.home_team} (Week ${game.week})`);
      });
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchNFLSchedule };
