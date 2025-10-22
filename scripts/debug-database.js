#!/usr/bin/env node

/**
 * Debug script to check what's in the database
 */

const { getRows } = require('../lib/database/hybrid-connection');

async function debugDatabase() {
  try {
    console.log('🔍 Checking database contents...');
    
    // Check players table
    console.log('\n📊 Players table:');
    const players = await getRows('SELECT player_id, first_name, last_name, position, team FROM players LIMIT 10');
    console.log('Players found:', players.length);
    players.forEach(p => console.log(`- ${p.player_id}: ${p.first_name} ${p.last_name} (${p.position}, ${p.team})`));
    
    // Check player_game_stats table
    console.log('\n📊 Player Game Stats table:');
    const gameStats = await getRows('SELECT player_id, week, passing_yards, rushing_yards, receiving_yards FROM player_game_stats WHERE season = 2025 AND week = 6 LIMIT 10');
    console.log('Game stats found:', gameStats.length);
    gameStats.forEach(gs => console.log(`- Player ${gs.player_id}, Week ${gs.week}: Pass=${gs.passing_yards}, Rush=${gs.rushing_yards}, Rec=${gs.receiving_yards}`));
    
    // Check if we have any data for week 6
    console.log('\n📊 Week 6 top performers:');
    const week6Passing = await getRows(`
      SELECT 
        p.player_id,
        p.first_name,
        p.last_name,
        p.position,
        pgs.passing_yards
      FROM players p
      JOIN player_game_stats pgs ON p.player_id = pgs.player_id
      WHERE pgs.season = 2025 AND pgs.week = 6 AND pgs.passing_yards > 0
      ORDER BY pgs.passing_yards DESC
      LIMIT 5
    `);
    console.log('Week 6 passing leaders:', week6Passing.length);
    week6Passing.forEach(p => console.log(`- ${p.player_id}: ${p.first_name} ${p.last_name} - ${p.passing_yards} yards`));
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

debugDatabase();
