const fs = require('fs');
const path = require('path');

async function fetchRealESPNSchedule() {
  try {
    console.log('🏈 Fetching real NFL 2025 schedule from ESPN...');
    
    // ESPN API endpoints for NFL schedule
    const baseUrl = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl';
    
    // Try different endpoints to get the most current data
    const endpoints = [
      `${baseUrl}/seasons/2025/events`,
      `${baseUrl}/events`,
      `${baseUrl}/seasons/2024/events` // Fallback to 2024 if 2025 not available
    ];
    
    let allGames = [];
    let successfulEndpoint = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          console.log(`❌ Endpoint failed: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`✅ Successfully fetched data from ${endpoint}`);
        console.log(`📊 Found ${data.count || 0} games`);
        
        if (data.items && data.items.length > 0) {
          console.log('🔍 Sample raw game data:');
          console.log(JSON.stringify(data.items[0], null, 2));
          allGames = data.items;
          successfulEndpoint = endpoint;
          break;
        }
      } catch (error) {
        console.log(`❌ Error with endpoint ${endpoint}:`, error.message);
        continue;
      }
    }
    
    if (allGames.length === 0) {
      throw new Error('No games found from any ESPN endpoint');
    }
    
    console.log(`🎉 Successfully fetched ${allGames.length} games from ESPN`);
    
    // Process all games - handle both direct data and references
    const processedGames = [];
    
    for (const game of allGames) {
      try {
        let gameData;
        
        // Check if this is a reference that needs to be fetched
        if (game.$ref) {
          console.log(`📡 Fetching detailed data for game: ${game.$ref}`);
          const gameResponse = await fetch(game.$ref);
          if (gameResponse.ok) {
            const detailedGame = await gameResponse.json();
            gameData = await processGameData(detailedGame);
          } else {
            console.log(`❌ Failed to fetch game details: ${gameResponse.status}`);
            continue;
          }
        } else {
          // Direct game data
          gameData = await processGameData(game);
        }
        
        if (gameData) {
          processedGames.push(gameData);
        }
      } catch (error) {
        console.error(`❌ Error processing game:`, error.message);
      }
    }
    
    console.log(`✅ Processed ${processedGames.length} games`);
    
    // Sort games by date
    processedGames.sort((a, b) => new Date(a.game_date) - new Date(b.game_date));
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'data', 'espn-2025-schedule.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedGames, null, 2), 'utf8');
    console.log(`💾 Saved schedule to ${outputPath}`);
    
    // Show sample games
    if (processedGames.length > 0) {
      console.log('📅 Sample games:');
      processedGames.slice(0, 5).forEach(game => {
        console.log(`  - Week ${game.week}: ${game.away_team_name} @ ${game.home_team_name} (${new Date(game.game_date).toLocaleDateString()})`);
      });
    }
    
    return processedGames;
    
  } catch (error) {
    console.error('❌ Error fetching ESPN schedule:', error);
    throw error;
  }
}

async function processGameData(game) {
  try {
    // Extract basic game info
    const gameId = game.id;
    const gameDate = game.date;
    const gameStatus = game.status?.type?.name || 'Scheduled';
    
    // Extract week information
    const week = extractWeekFromGame(game);
    
    // Extract teams
    const competitors = game.competitions?.[0]?.competitors || [];
    const homeTeam = competitors.find(c => c.homeAway === 'home');
    const awayTeam = competitors.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) {
      console.log(`⚠️ Skipping game ${gameId} - missing team data`);
      return null;
    }
    
    // Extract venue information
    const venue = game.competitions?.[0]?.venue || {};
    
    // Extract broadcast information
    const broadcasts = game.competitions?.[0]?.broadcasts || [];
    const broadcastInfo = extractBroadcastInfo(broadcasts);
    
    // Extract weather information
    const weather = game.competitions?.[0]?.weather;
    const weatherInfo = extractWeatherInfo(weather);
    
    // Create comprehensive game data
    const gameData = {
      game_id: gameId,
      season: 2025,
      week: week,
      game_date: gameDate,
      game_time: extractGameTime(gameDate),
      home_team_id: homeTeam.team?.id || null,
      home_team_name: homeTeam.team?.displayName || homeTeam.team?.name || 'Unknown',
      home_team_abbr: homeTeam.team?.abbreviation || 'UNK',
      home_score: homeTeam.score || null,
      away_team_id: awayTeam.team?.id || null,
      away_team_name: awayTeam.team?.displayName || awayTeam.team?.name || 'Unknown',
      away_team_abbr: awayTeam.team?.abbreviation || 'UNK',
      away_score: awayTeam.score || null,
      venue_name: venue.fullName || null,
      venue_city: venue.address?.city || null,
      venue_state: venue.address?.state || null,
      venue_capacity: venue.capacity || null,
      venue_indoor: venue.indoor || null,
      broadcast_primary: broadcastInfo.primary || null,
      broadcast_all: broadcastInfo.all || null,
      broadcast_networks: broadcastInfo.networks || null,
      status: gameStatus,
      game_type: extractGameType(game),
      weather_temperature: weatherInfo.temperature || null,
      weather_condition: weatherInfo.condition || null,
      weather_humidity: weatherInfo.humidity || null,
      weather_wind_speed: weatherInfo.windSpeed || null,
      weather_wind_direction: weatherInfo.windDirection || null,
      created_at: new Date().toISOString()
    };
    
    return gameData;
    
  } catch (error) {
    console.error(`❌ Error processing game ${game.id}:`, error);
    return null;
  }
}

function extractWeekFromGame(game) {
  // Try to extract week from various sources
  const week = game.week?.number || 
               game.season?.week || 
               game.competitions?.[0]?.week || 
               1; // Default to week 1
  
  return parseInt(week) || 1;
}

function extractGameTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function extractBroadcastInfo(broadcasts) {
  if (!broadcasts) {
    return { primary: null, all: null, networks: null };
  }
  
  // Handle both array and object formats
  let broadcastArray = [];
  if (Array.isArray(broadcasts)) {
    broadcastArray = broadcasts;
  } else if (broadcasts.items && Array.isArray(broadcasts.items)) {
    broadcastArray = broadcasts.items;
  } else if (broadcasts.$ref) {
    // It's a reference, we can't process it here
    return { primary: null, all: null, networks: null };
  }
  
  if (broadcastArray.length === 0) {
    return { primary: null, all: null, networks: null };
  }
  
  const primary = broadcastArray[0]?.media?.shortName || broadcastArray[0]?.media?.name || null;
  const all = broadcastArray.map(b => b.media?.shortName || b.media?.name).filter(Boolean).join(', ');
  const networks = broadcastArray.map(b => b.media?.shortName || b.media?.name).filter(Boolean);
  
  return {
    primary,
    all: all || null,
    networks: networks.length > 0 ? networks : null
  };
}

function extractWeatherInfo(weather) {
  if (!weather) {
    return {
      temperature: null,
      condition: null,
      humidity: null,
      windSpeed: null,
      windDirection: null
    };
  }
  
  return {
    temperature: weather.temperature || null,
    condition: weather.condition || null,
    humidity: weather.humidity || null,
    windSpeed: weather.windSpeed || null,
    windDirection: weather.windDirection || null
  };
}

function extractGameType(game) {
  // Determine if it's regular season, playoffs, etc.
  const week = extractWeekFromGame(game);
  
  if (week <= 18) {
    return 'Regular Season';
  } else if (week <= 22) {
    return 'Playoffs';
  } else {
    return 'Other';
  }
}

// Run the script
if (require.main === module) {
  fetchRealESPNSchedule()
    .then(games => {
      console.log(`🎉 Successfully fetched ${games.length} games from ESPN`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchRealESPNSchedule };
