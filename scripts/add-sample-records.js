#!/usr/bin/env node

/**
 * Add Sample Team Records Script
 * Adds sample win/loss records to all teams
 */

const { getDatabase } = require('../lib/database/connection');

// Sample team records for 2025 season (realistic data)
const teamRecords = [
  { team_abbr: 'ARI', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'ATL', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'BAL', wins: 5, losses: 2, ties: 0 },
  { team_abbr: 'BUF', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'CAR', wins: 2, losses: 5, ties: 0 },
  { team_abbr: 'CHI', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'CIN', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'CLE', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'DAL', wins: 5, losses: 2, ties: 0 },
  { team_abbr: 'DEN', wins: 2, losses: 5, ties: 0 },
  { team_abbr: 'DET', wins: 6, losses: 1, ties: 0 },
  { team_abbr: 'GB', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'HOU', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'IND', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'JAX', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'KC', wins: 5, losses: 2, ties: 0 },
  { team_abbr: 'LAC', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'LAR', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'LV', wins: 2, losses: 5, ties: 0 },
  { team_abbr: 'MIA', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'MIN', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'NE', wins: 2, losses: 5, ties: 0 },
  { team_abbr: 'NO', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'NYG', wins: 2, losses: 5, ties: 0 },
  { team_abbr: 'NYJ', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'PHI', wins: 5, losses: 2, ties: 0 },
  { team_abbr: 'PIT', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'SF', wins: 6, losses: 1, ties: 0 },
  { team_abbr: 'SEA', wins: 4, losses: 3, ties: 0 },
  { team_abbr: 'TB', wins: 3, losses: 4, ties: 0 },
  { team_abbr: 'TEN', wins: 2, losses: 5, ties: 0 },
  { team_abbr: 'WAS', wins: 3, losses: 4, ties: 0 }
];

async function addTeamRecords() {
  console.log('🏈 Adding team records to database...');
  
  try {
    const db = getDatabase();
    
    let updated = 0;
    for (const record of teamRecords) {
      try {
        // Update team with record data
        db.prepare(`
          UPDATE teams SET 
            wins = ?, 
            losses = ?, 
            ties = ?
          WHERE team_abbr = ?
        `).run(record.wins, record.losses, record.ties, record.team_abbr);
        
        console.log(`✅ Updated ${record.team_abbr} record: ${record.wins}-${record.losses}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating record for ${record.team_abbr}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updated} team records!`);
    
    // Verify the records were added
    const teamsCount = db.prepare('SELECT COUNT(*) as count FROM teams WHERE wins IS NOT NULL').get();
    console.log(`📊 Teams with records: ${teamsCount.count}`);
    
  } catch (error) {
    console.error('❌ Error adding team records:', error);
    process.exit(1);
  }
}

// Run the script
addTeamRecords();
