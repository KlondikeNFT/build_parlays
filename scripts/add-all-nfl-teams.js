#!/usr/bin/env node

/**
 * Add All NFL Teams Script
 * Adds all 32 NFL teams with Wikipedia logos to the database
 */

const { getDatabase } = require('../lib/database/connection');

// Complete list of all 32 NFL teams with their data
const allNFLTeams = [
  // AFC East
  { team_id: 'BUF', team_name: 'Buffalo Bills', team_abbr: 'BUF', team_conference: 'AFC', team_division: 'East', team_color_primary: '#00338D', team_color_secondary: '#C60C30', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/77/Buffalo_Bills_logo.svg' },
  { team_id: 'MIA', team_name: 'Miami Dolphins', team_abbr: 'MIA', team_conference: 'AFC', team_division: 'East', team_color_primary: '#008E97', team_color_secondary: '#FC4C02', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/37/Miami_Dolphins_logo.svg' },
  { team_id: 'NE', team_name: 'New England Patriots', team_abbr: 'NE', team_conference: 'AFC', team_division: 'East', team_color_primary: '#002244', team_color_secondary: '#C60C30', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/b/b9/New_England_Patriots_logo.svg' },
  { team_id: 'NYJ', team_name: 'New York Jets', team_abbr: 'NYJ', team_conference: 'AFC', team_division: 'East', team_color_primary: '#125740', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/6/6b/New_York_Jets_logo.svg' },
  
  // AFC North
  { team_id: 'BAL', team_name: 'Baltimore Ravens', team_abbr: 'BAL', team_conference: 'AFC', team_division: 'North', team_color_primary: '#241773', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/1/16/Baltimore_Ravens_logo.svg' },
  { team_id: 'CIN', team_name: 'Cincinnati Bengals', team_abbr: 'CIN', team_conference: 'AFC', team_division: 'North', team_color_primary: '#FB4F14', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/8/81/Cincinnati_Bengals_logo.svg' },
  { team_id: 'CLE', team_name: 'Cleveland Browns', team_abbr: 'CLE', team_conference: 'AFC', team_division: 'North', team_color_primary: '#311D00', team_color_secondary: '#FF3C00', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Cleveland_Browns_logo.svg' },
  { team_id: 'PIT', team_name: 'Pittsburgh Steelers', team_abbr: 'PIT', team_conference: 'AFC', team_division: 'North', team_color_primary: '#FFB612', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/d/de/Pittsburgh_Steelers_logo.svg' },
  
  // AFC South
  { team_id: 'HOU', team_name: 'Houston Texans', team_abbr: 'HOU', team_conference: 'AFC', team_division: 'South', team_color_primary: '#03202F', team_color_secondary: '#A71930', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/2/28/Houston_Texans_logo.svg' },
  { team_id: 'IND', team_name: 'Indianapolis Colts', team_abbr: 'IND', team_conference: 'AFC', team_division: 'South', team_color_primary: '#002C5F', team_color_secondary: '#A2AAAD', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Indianapolis_Colts_logo.svg' },
  { team_id: 'JAX', team_name: 'Jacksonville Jaguars', team_abbr: 'JAX', team_conference: 'AFC', team_division: 'South', team_color_primary: '#006778', team_color_secondary: '#9F792C', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/74/Jacksonville_Jaguars_logo.svg' },
  { team_id: 'TEN', team_name: 'Tennessee Titans', team_abbr: 'TEN', team_conference: 'AFC', team_division: 'South', team_color_primary: '#0C2340', team_color_secondary: '#4B92DB', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Tennessee_Titans_logo.svg' },
  
  // AFC West
  { team_id: 'DEN', team_name: 'Denver Broncos', team_abbr: 'DEN', team_conference: 'AFC', team_division: 'West', team_color_primary: '#FB4F14', team_color_secondary: '#002244', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/4/44/Denver_Broncos_logo.svg' },
  { team_id: 'KC', team_name: 'Kansas City Chiefs', team_abbr: 'KC', team_conference: 'AFC', team_division: 'West', team_color_primary: '#E31837', team_color_secondary: '#FFB81C', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/e/e1/Kansas_City_Chiefs_logo.svg' },
  { team_id: 'LV', team_name: 'Las Vegas Raiders', team_abbr: 'LV', team_conference: 'AFC', team_division: 'West', team_color_primary: '#000000', team_color_secondary: '#A5ACAF', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/0/0a/Las_Vegas_Raiders_logo.svg' },
  { team_id: 'LAC', team_name: 'Los Angeles Chargers', team_abbr: 'LAC', team_conference: 'AFC', team_division: 'West', team_color_primary: '#0080C6', team_color_secondary: '#FFC20E', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/72/Los_Angeles_Chargers_logo.svg' },
  
  // NFC East
  { team_id: 'DAL', team_name: 'Dallas Cowboys', team_abbr: 'DAL', team_conference: 'NFC', team_division: 'East', team_color_primary: '#003594', team_color_secondary: '#041E42', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/50/Dallas_Cowboys_logo.svg' },
  { team_id: 'NYG', team_name: 'New York Giants', team_abbr: 'NYG', team_conference: 'NFC', team_division: 'East', team_color_primary: '#0B2265', team_color_secondary: '#A71930', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/3b/New_York_Giants_logo.svg' },
  { team_id: 'PHI', team_name: 'Philadelphia Eagles', team_abbr: 'PHI', team_conference: 'NFC', team_division: 'East', team_color_primary: '#004C54', team_color_secondary: '#A5ACAF', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Philadelphia_Eagles_logo.svg' },
  { team_id: 'WAS', team_name: 'Washington Commanders', team_abbr: 'WAS', team_conference: 'NFC', team_division: 'East', team_color_primary: '#5A1414', team_color_secondary: '#FFB612', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/6/67/Washington_Commanders_logo.svg' },
  
  // NFC North
  { team_id: 'CHI', team_name: 'Chicago Bears', team_abbr: 'CHI', team_conference: 'NFC', team_division: 'North', team_color_primary: '#0B162A', team_color_secondary: '#C83803', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/5c/Chicago_Bears_logo.svg' },
  { team_id: 'DET', team_name: 'Detroit Lions', team_abbr: 'DET', team_conference: 'NFC', team_division: 'North', team_color_primary: '#0076B6', team_color_secondary: '#B0B7BC', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/71/Detroit_Lions_logo.svg' },
  { team_id: 'GB', team_name: 'Green Bay Packers', team_abbr: 'GB', team_conference: 'NFC', team_division: 'North', team_color_primary: '#203731', team_color_secondary: '#FFB612', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/50/Green_Bay_Packers_logo.svg' },
  { team_id: 'MIN', team_name: 'Minnesota Vikings', team_abbr: 'MIN', team_conference: 'NFC', team_division: 'North', team_color_primary: '#4F2683', team_color_secondary: '#FFC62F', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/4/48/Minnesota_Vikings_logo.svg' },
  
  // NFC South
  { team_id: 'ATL', team_name: 'Atlanta Falcons', team_abbr: 'ATL', team_conference: 'NFC', team_division: 'South', team_color_primary: '#A71930', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/c/c5/Atlanta_Falcons_logo.svg' },
  { team_id: 'CAR', team_name: 'Carolina Panthers', team_abbr: 'CAR', team_conference: 'NFC', team_division: 'South', team_color_primary: '#0085CA', team_color_secondary: '#101820', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Carolina_Panthers_logo.svg' },
  { team_id: 'NO', team_name: 'New Orleans Saints', team_abbr: 'NO', team_conference: 'NFC', team_division: 'South', team_color_primary: '#D3BC8D', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/5/50/New_Orleans_Saints_logo.svg' },
  { team_id: 'TB', team_name: 'Tampa Bay Buccaneers', team_abbr: 'TB', team_conference: 'NFC', team_division: 'South', team_color_primary: '#D50A0A', team_color_secondary: '#FF7900', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Tampa_Bay_Buccaneers_logo.svg' },
  
  // NFC West
  { team_id: 'ARI', team_name: 'Arizona Cardinals', team_abbr: 'ARI', team_conference: 'NFC', team_division: 'West', team_color_primary: '#97233F', team_color_secondary: '#000000', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/7/72/Arizona_Cardinals_logo.svg' },
  { team_id: 'LAR', team_name: 'Los Angeles Rams', team_abbr: 'LAR', team_conference: 'NFC', team_division: 'West', team_color_primary: '#003594', team_color_secondary: '#FFA300', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/8/8a/Los_Angeles_Rams_logo.svg' },
  { team_id: 'SF', team_name: 'San Francisco 49ers', team_abbr: 'SF', team_conference: 'NFC', team_division: 'West', team_color_primary: '#AA0000', team_color_secondary: '#B3995D', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/3/3b/San_Francisco_49ers_logo.svg' },
  { team_id: 'SEA', team_name: 'Seattle Seahawks', team_abbr: 'SEA', team_conference: 'NFC', team_division: 'West', team_color_primary: '#002244', team_color_secondary: '#69BE28', team_logo_url: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Seattle_Seahawks_logo.svg' }
];

async function addAllTeams() {
  console.log('🏈 Adding all 32 NFL teams to database...');
  
  try {
    const db = getDatabase();
    
    const insertTeam = db.prepare(`
      INSERT OR REPLACE INTO teams (
        team_id, team_name, team_abbr, team_conference, team_division,
        team_color_primary, team_color_secondary, team_logo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let added = 0;
    for (const team of allNFLTeams) {
      try {
        insertTeam.run(
          team.team_id,
          team.team_name,
          team.team_abbr,
          team.team_conference,
          team.team_division,
          team.team_color_primary,
          team.team_color_secondary,
          team.team_logo_url
        );
        console.log(`✅ Added ${team.team_name}`);
        added++;
      } catch (error) {
        console.error(`❌ Error adding team ${team.team_name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully added ${added} teams to database!`);
    
    // Verify the teams were added
    const teamsCount = db.prepare('SELECT COUNT(*) as count FROM teams').get();
    console.log(`📊 Total teams in database: ${teamsCount.count}`);
    
  } catch (error) {
    console.error('❌ Error adding teams:', error);
    process.exit(1);
  }
}

// Run the script
addAllTeams();
