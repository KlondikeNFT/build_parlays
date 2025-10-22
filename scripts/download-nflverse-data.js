#!/usr/bin/env node

/**
 * NFLverse Data Download Script
 * Downloads NFL data from NFLverse repository
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');

// NFLverse data URLs (these are the actual URLs from the repository)
const NFLVERSE_URLS = {
  // Teams data
  teams: 'https://github.com/nflverse/nflverse-data/releases/download/teams/teams.csv',
  
  // Players data
  players: 'https://github.com/nflverse/nflverse-data/releases/download/players/players.csv',
  
  // Games data
  games: 'https://github.com/nflverse/nflverse-data/releases/download/games/games.csv',
  
  // Player game stats
  playerGameStats: 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats.csv',
  
  // Player season stats
  playerSeasonStats: 'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats.csv',
  
  // Injuries data
  injuries: 'https://github.com/nflverse/nflverse-data/releases/download/injuries/injuries.csv',
  
  // Schedules
  schedules: 'https://github.com/nflverse/nflverse-data/releases/download/schedules/schedules.csv',
};

const DATA_DIR = path.join(process.cwd(), 'data', 'nflverse');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Download a file from URL
 */
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, filename);
    const file = createWriteStream(filePath);
    
    console.log(`📥 Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded ${filename}`);
          resolve(filePath);
        });
        
        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        downloadFile(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Download all NFLverse data
 */
async function downloadAllData() {
  console.log('🏈 Starting NFLverse data download...');
  console.log(`📁 Data will be saved to: ${DATA_DIR}`);
  
  const downloads = [];
  
  for (const [key, url] of Object.entries(NFLVERSE_URLS)) {
    const filename = `${key}.csv`;
    downloads.push(
      downloadFile(url, filename)
        .catch(err => {
          console.error(`❌ Failed to download ${filename}:`, err.message);
          return null;
        })
    );
  }
  
  try {
    const results = await Promise.all(downloads);
    const successful = results.filter(result => result !== null);
    
    console.log(`\n🎉 Download complete!`);
    console.log(`✅ Successfully downloaded: ${successful.length} files`);
    console.log(`❌ Failed downloads: ${results.length - successful.length} files`);
    
    if (successful.length > 0) {
      console.log('\n📊 Downloaded files:');
      successful.forEach(filePath => {
        const filename = path.basename(filePath);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`  - ${filename} (${sizeKB} KB)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during download:', error);
    process.exit(1);
  }
}

/**
 * Download specific season data
 */
async function downloadSeasonData(season) {
  console.log(`🏈 Downloading ${season} season data...`);
  
  const seasonUrls = {
    games: `https://github.com/nflverse/nflverse-data/releases/download/games/games_${season}.csv`,
    playerGameStats: `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_${season}.csv`,
    schedules: `https://github.com/nflverse/nflverse-data/releases/download/schedules/schedules_${season}.csv`,
  };
  
  const downloads = [];
  
  for (const [key, url] of Object.entries(seasonUrls)) {
    const filename = `${key}_${season}.csv`;
    downloads.push(
      downloadFile(url, filename)
        .catch(err => {
          console.error(`❌ Failed to download ${filename}:`, err.message);
          return null;
        })
    );
  }
  
  try {
    const results = await Promise.all(downloads);
    const successful = results.filter(result => result !== null);
    
    console.log(`\n🎉 ${season} season download complete!`);
    console.log(`✅ Successfully downloaded: ${successful.length} files`);
    
  } catch (error) {
    console.error('❌ Error during season download:', error);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'all') {
  downloadAllData();
} else if (command === 'season' && args[1]) {
  downloadSeasonData(args[1]);
} else {
  console.log('🏈 NFLverse Data Downloader');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/download-nflverse-data.js all          # Download all data');
  console.log('  node scripts/download-nflverse-data.js season 2024  # Download specific season');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/download-nflverse-data.js all');
  console.log('  node scripts/download-nflverse-data.js season 2024');
  console.log('  node scripts/download-nflverse-data.js season 2025');
}



