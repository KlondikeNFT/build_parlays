/**
 * Weekly Top Players API Route
 * Analyzes previous week's game stats to identify top performers
 */

import { NextResponse } from 'next/server';
import { getRows, getRow } from '@/lib/database/hybrid-connection';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '6'; // Default to previous week (Week 6)
    
    console.log(`🏈 Analyzing Week ${week} stats for top performers...`);
    
    // Get top performers by category for the specified week
    const topPerformers = {
      passing: await getTopPassingPerformers(parseInt(week)),
      rushing: await getTopRushingPerformers(parseInt(week)),
      receiving: await getTopReceivingPerformers(parseInt(week)),
      touchdowns: await getTopTouchdownPerformers(parseInt(week)),
      receptions: await getTopReceptionPerformers(parseInt(week))
    };
    
    // Combine and rank all top performers
    const allPerformers = new Map();
    
    // Add passing leaders
    topPerformers.passing.forEach((player: any, index) => {
      const key = player.player_id;
      if (!allPerformers.has(key)) {
        allPerformers.set(key, {
          ...player,
          team: player.team, // Ensure team is preserved
          achievements: [],
          totalScore: 0
        });
      }
      allPerformers.get(key).achievements.push({
        category: 'passing',
        stat: 'passing_yards',
        value: player.passing_yards,
        rank: index + 1,
        description: `Led Week ${week} in passing yards (${player.passing_yards})`
      });
      allPerformers.get(key).totalScore += (5 - index) * 10; // Top 5 get points
    });
    
    // Add rushing leaders
    topPerformers.rushing.forEach((player: any, index) => {
      const key = player.player_id;
      if (!allPerformers.has(key)) {
        allPerformers.set(key, {
          ...player,
          team: player.team, // Ensure team is preserved
          achievements: [],
          totalScore: 0
        });
      }
      allPerformers.get(key).achievements.push({
        category: 'rushing',
        stat: 'rushing_yards',
        value: player.rushing_yards,
        rank: index + 1,
        description: `Led Week ${week} in rushing yards (${player.rushing_yards})`
      });
      allPerformers.get(key).totalScore += (5 - index) * 10;
    });
    
    // Add receiving leaders
    topPerformers.receiving.forEach((player: any, index) => {
      const key = player.player_id;
      if (!allPerformers.has(key)) {
        allPerformers.set(key, {
          ...player,
          team: player.team, // Ensure team is preserved
          achievements: [],
          totalScore: 0
        });
      }
      allPerformers.get(key).achievements.push({
        category: 'receiving',
        stat: 'receiving_yards',
        value: player.receiving_yards,
        rank: index + 1,
        description: `Led Week ${week} in receiving yards (${player.receiving_yards})`
      });
      allPerformers.get(key).totalScore += (5 - index) * 10;
    });
    
    // Add touchdown leaders
    topPerformers.touchdowns.forEach((player: any, index) => {
      const key = player.player_id;
      if (!allPerformers.has(key)) {
        allPerformers.set(key, {
          ...player,
          team: player.team, // Ensure team is preserved
          achievements: [],
          totalScore: 0
        });
      }
      allPerformers.get(key).achievements.push({
        category: 'touchdowns',
        stat: 'total_touchdowns',
        value: player.total_touchdowns,
        rank: index + 1,
        description: `Led Week ${week} in touchdowns (${player.total_touchdowns})`
      });
      allPerformers.get(key).totalScore += (5 - index) * 15; // TDs worth more
    });
    
    // Add reception leaders
    topPerformers.receptions.forEach((player: any, index) => {
      const key = player.player_id;
      if (!allPerformers.has(key)) {
        allPerformers.set(key, {
          ...player,
          team: player.team, // Ensure team is preserved
          achievements: [],
          totalScore: 0
        });
      }
      allPerformers.get(key).achievements.push({
        category: 'receptions',
        stat: 'receptions',
        value: player.receptions,
        rank: index + 1,
        description: `Led Week ${week} in receptions (${player.receptions})`
      });
      allPerformers.get(key).totalScore += (5 - index) * 8;
    });
    
    // Sort by total score and take top 8
    const topPlayers = Array.from(allPerformers.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8)
      .map(player => ({
        ...player,
        player_name: `${player.first_name} ${player.last_name}`,
        // Generate parlay predictions based on performance
        parlayPredictions: generateParlayPredictions(player),
        // Calculate consistency score
        consistencyScore: calculateConsistencyScore(player),
        // Get team colors
        teamColors: getTeamColors(player.team)
      }));console.log(`✅ Found ${topPlayers.length} top performers for Week ${week}`);
    
    return NextResponse.json({
      week: parseInt(week),
      topPlayers,
      totalPlayers: topPlayers.length
    });
    
  } catch (error: any) {
    console.error('Error analyzing weekly top players:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getTopPassingPerformers(week: number) {
  return await getRows(`
    SELECT 
      p.player_id,
      p.first_name,
      p.last_name,
      p.first_name || ' ' || p.last_name as player_name,
      p.position,
      COALESCE(p.team, pgs.team, (
        SELECT team FROM player_game_stats pgs2 
        WHERE pgs2.player_id = p.player_id 
        AND pgs2.team IS NOT NULL AND pgs2.team != ''
        ORDER BY pgs2.week DESC LIMIT 1
      )) as team,
      pgs.passing_yards,
      pgs.passing_touchdowns,
      pgs.passing_completions,
      pgs.passing_attempts
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    WHERE pgs.season = 2025 AND pgs.week = ? AND pgs.passing_yards > 0
    ORDER BY pgs.passing_yards DESC
    LIMIT 5
  `, [week]);
}

async function getTopRushingPerformers(week: number) {
  return await getRows(`
    SELECT 
      p.player_id,
      p.first_name,
      p.last_name,
      p.first_name || ' ' || p.last_name as player_name,
      p.position,
      COALESCE(p.team, pgs.team, (
        SELECT team FROM player_game_stats pgs2 
        WHERE pgs2.player_id = p.player_id 
        AND pgs2.team IS NOT NULL AND pgs2.team != ''
        ORDER BY pgs2.week DESC LIMIT 1
      )) as team,
      pgs.rushing_yards,
      pgs.rushing_touchdowns,
      pgs.rushing_attempts
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    WHERE pgs.season = 2025 AND pgs.week = ? AND pgs.rushing_yards > 0
    ORDER BY pgs.rushing_yards DESC
    LIMIT 5
  `, [week]);
}

async function getTopReceivingPerformers(week: number) {
  return await getRows(`
    SELECT 
      p.player_id,
      p.first_name,
      p.last_name,
      p.first_name || ' ' || p.last_name as player_name,
      p.position,
      COALESCE(p.team, pgs.team, (
        SELECT team FROM player_game_stats pgs2 
        WHERE pgs2.player_id = p.player_id 
        AND pgs2.team IS NOT NULL AND pgs2.team != ''
        ORDER BY pgs2.week DESC LIMIT 1
      )) as team,
      pgs.receiving_yards,
      pgs.receiving_touchdowns,
      pgs.receiving_targets
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    WHERE pgs.season = 2025 AND pgs.week = ? AND pgs.receiving_yards > 0
    ORDER BY pgs.receiving_yards DESC
    LIMIT 5
  `, [week]);
}

async function getTopTouchdownPerformers(week: number) {
  return await getRows(`
    SELECT 
      p.player_id,
      p.first_name,
      p.last_name,
      p.first_name || ' ' || p.last_name as player_name,
      p.position,
      COALESCE(p.team, pgs.team, (
        SELECT team FROM player_game_stats pgs2 
        WHERE pgs2.player_id = p.player_id 
        AND pgs2.team IS NOT NULL AND pgs2.team != ''
        ORDER BY pgs2.week DESC LIMIT 1
      )) as team,
      (pgs.passing_touchdowns + pgs.rushing_touchdowns + pgs.receiving_touchdowns) as total_touchdowns,
      pgs.passing_touchdowns,
      pgs.rushing_touchdowns,
      pgs.receiving_touchdowns
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    WHERE pgs.season = 2025 AND pgs.week = ? 
      AND (pgs.passing_touchdowns + pgs.rushing_touchdowns + pgs.receiving_touchdowns) > 0
    ORDER BY total_touchdowns DESC
    LIMIT 5
  `, [week]);
}

async function getTopReceptionPerformers(week: number) {
  return await getRows(`
    SELECT 
      p.player_id,
      p.first_name,
      p.last_name,
      p.first_name || ' ' || p.last_name as player_name,
      p.position,
      COALESCE(p.team, pgs.team, (
        SELECT team FROM player_game_stats pgs2 
        WHERE pgs2.player_id = p.player_id 
        AND pgs2.team IS NOT NULL AND pgs2.team != ''
        ORDER BY pgs2.week DESC LIMIT 1
      )) as team,
      pgs.receptions,
      pgs.receiving_targets
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    WHERE pgs.season = 2025 AND pgs.week = ? AND pgs.receptions > 0
    ORDER BY pgs.receptions DESC
    LIMIT 5
  `, [week]);
}

function generateParlayPredictions(player: any) {
  const predictions = [];
  
  // Generate predictions based on position and performance
  if (player.position === 'QB') {
    if (player.passing_yards > 300) {
      predictions.push({
        type: 'Over/Under',
        description: 'Passing Yards Over 250',
        confidence: 85,
        reasoning: `Averaged ${player.passing_yards} yards in Week ${player.week}`
      });
    }
    if (player.passing_touchdowns >= 2) {
      predictions.push({
        type: 'Touchdowns',
        description: '2+ Passing TDs',
        confidence: 75,
        reasoning: `Scored ${player.passing_touchdowns} TDs last week`
      });
    }
  } else if (player.position === 'RB') {
    if (player.rushing_yards > 100) {
      predictions.push({
        type: 'Over/Under',
        description: 'Rushing Yards Over 80',
        confidence: 80,
        reasoning: `Rushed for ${player.rushing_yards} yards in Week ${player.week}`
      });
    }
  } else if (player.position === 'WR' || player.position === 'TE') {
    if (player.receiving_yards > 100) {
      predictions.push({
        type: 'Over/Under',
        description: 'Receiving Yards Over 75',
        confidence: 78,
        reasoning: `Caught ${player.receiving_yards} yards in Week ${player.week}`
      });
    }
    if (player.receptions >= 8) {
      predictions.push({
        type: 'Receptions',
        description: '6+ Receptions',
        confidence: 82,
        reasoning: `Had ${player.receptions} catches last week`
      });
    }
  }
  
  return predictions;
}

function calculateConsistencyScore(player: any) {
  // Simple consistency calculation based on achievements
  const baseScore = 60;
  const achievementBonus = player.achievements.length * 5;
  const positionBonus = player.position === 'QB' ? 10 : 5;
  
  return Math.min(95, baseScore + achievementBonus + positionBonus);
}

function getTeamColors(teamAbbr: string) {
  // Team color mapping
  const teamColors: Record<string, { primary: string; secondary: string }> = {
    'KC': { primary: '#E31837', secondary: '#FFB81C' },
    'BUF': { primary: '#00338D', secondary: '#C60C30' },
    'SF': { primary: '#AA0000', secondary: '#B3995D' },
    'DAL': { primary: '#003594', secondary: '#869397' },
    'PHI': { primary: '#004C54', secondary: '#A5ACAF' },
    'BAL': { primary: '#241773', secondary: '#000000' },
    'MIA': { primary: '#008E97', secondary: '#FC4C02' },
    'DET': { primary: '#0076B6', secondary: '#B0B7BC' },
    'TB': { primary: '#D50A0A', secondary: '#FF7900' },
    'HOU': { primary: '#03202F', secondary: '#A71930' },
    'SEA': { primary: '#002244', secondary: '#69BE28' },
    'GB': { primary: '#203731', secondary: '#FFB612' },
    'ARI': { primary: '#97233F', secondary: '#000000' },
    'ATL': { primary: '#A71930', secondary: '#000000' },
    'CAR': { primary: '#0085CA', secondary: '#101820' },
    'CHI': { primary: '#0B162A', secondary: '#C83803' },
    'CIN': { primary: '#FB4F14', secondary: '#000000' },
    'CLE': { primary: '#311D00', secondary: '#FF3C00' },
    'DEN': { primary: '#FB4F14', secondary: '#002244' },
    'IND': { primary: '#002C5F', secondary: '#A2AAAD' },
    'JAX': { primary: '#006778', secondary: '#9F792C' },
    'LAC': { primary: '#0080C6', secondary: '#FFC20E' },
    'LA': { primary: '#003594', secondary: '#FFA300' },
    'LV': { primary: '#000000', secondary: '#A5ACAF' },
    'MIN': { primary: '#4F2683', secondary: '#FFC62F' },
    'NE': { primary: '#002244', secondary: '#C60C30' },
    'NO': { primary: '#D3BC8D', secondary: '#000000' },
    'NYG': { primary: '#0B2265', secondary: '#A71930' },
    'NYJ': { primary: '#125740', secondary: '#000000' },
    'PIT': { primary: '#FFB612', secondary: '#000000' },
    'TEN': { primary: '#0C2340', secondary: '#4B92DB' },
    'WAS': { primary: '#5A1414', secondary: '#FFB612' }
  };
  
  return teamColors[teamAbbr] || { primary: '#000000', secondary: '#FFFFFF' };
}
