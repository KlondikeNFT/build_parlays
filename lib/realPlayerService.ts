/**
 * Real Player Service using SportsDataIO
 * Fetches actual week-by-week game logs and analyzes real performance data
 */

import {
  sportsdataApi,
  CURRENT_SEASON,
  type SDPlayerGame,
  type SDInjury,
  type SDPlayerSeason,
} from './sportsdataio';
import type { TopPlayer, StatPrediction } from './statsAnalyzer';
import {
  analyzeQBGameLogs,
  analyzeRBGameLogs,
  analyzeWRTEGameLogs,
  calculateGameLogConsistency,
} from './realGameAnalysis';

const MIN_GAMES_REQUIRED = 4;
const MAX_TOP_PLAYERS = 15;

const POSITION_LIMITS: Record<string, number> = {
  QB: 3,
  RB: 4,
  WR: 5,
  TE: 3,
};

const EXCLUDED_INJURY_STATUSES = new Set(
  [
    'out',
    'injured reserve',
    'ir',
    'suspended',
    'pup',
    'doubtful',
    'non football injury',
    'physically unable to perform',
    'illness',
  ].map((status) => status.toLowerCase())
);

/**
 * Get real top players from SportsDataIO with actual game log analysis.
 */
export async function getRealTopPlayersFromSportsData(): Promise<TopPlayer[]> {
  try {
    console.log('🔍 Fetching season stats from SportsDataIO...');
    
    // Step 1: Get season stats for all players
    const seasonStats = await sportsdataApi.getPlayerSeasonStats(CURRENT_SEASON);
    if (!seasonStats || seasonStats.length === 0) {
      console.warn('⚠️ No season stats returned');
      return [];
    }
    
    console.log(`✅ Found ${seasonStats.length} players with season stats`);
    
    // Step 2: Get injury data
    const injuries = await sportsdataApi.getInjuries();
    const injuryMap = buildInjuryMap(injuries);
    console.log(`📋 Loaded ${injuries.length} injury reports`);
    
    // Step 3: Filter to eligible players (played enough games, not injured)
    const eligiblePlayers = seasonStats.filter((player) => {
      // Must have played enough games
      if ((player.Played || 0) < MIN_GAMES_REQUIRED) return false;
      
      // Must not be injured
      const injury = injuryMap.get(player.PlayerID);
      if (injury && shouldExcludeInjuryStatus(injury.Status)) return false;
      
      // Must be a relevant position
      const pos = normalizePosition(player.Position || '');
      return ['QB', 'RB', 'WR', 'TE'].includes(pos);
    });
    
    console.log(`✅ ${eligiblePlayers.length} eligible players (played ${MIN_GAMES_REQUIRED}+ games, not injured)`);
    
    // Step 4: Select top candidates by position
    const topCandidates = gatherTopCandidates(eligiblePlayers);
    console.log(`🎯 Selected ${topCandidates.length} top candidates for game log analysis`);
    
    if (topCandidates.length === 0) {
      console.warn('⚠️ No top candidates found');
      return [];
    }
    
    // Step 5: Fetch game logs for these players
    const playerIds = topCandidates.map((p) => p.PlayerID);
    console.log(`📊 Fetching game logs for ${playerIds.length} players...`);
    
    const gameLogs = await sportsdataApi.getPlayerGameLogs(CURRENT_SEASON, playerIds);
    console.log(`✅ Retrieved ${gameLogs.length} total game records`);
    
    // Step 6: Group game logs by player and analyze
    const gameLogsByPlayer = new Map<number, SDPlayerGame[]>();
    for (const game of gameLogs) {
      if (!gameLogsByPlayer.has(game.PlayerID)) {
        gameLogsByPlayer.set(game.PlayerID, []);
      }
      gameLogsByPlayer.get(game.PlayerID)!.push(game);
    }
    
    // Step 7: Convert to TopPlayer with real analysis
    const topPlayers: TopPlayer[] = [];
    for (const seasonStat of topCandidates) {
      const playerGames = gameLogsByPlayer.get(seasonStat.PlayerID) || [];
      
      // Need at least 4 games for meaningful analysis
      const playedGames = playerGames.filter((g) => g.Played === 1);
      if (playedGames.length < MIN_GAMES_REQUIRED) {
        console.log(`⚠️ ${seasonStat.Name}: Only ${playedGames.length} games played, skipping`);
        continue;
      }
      
      const topPlayer = await convertToTopPlayer(seasonStat, playerGames, injuryMap);
      if (topPlayer) {
        topPlayers.push(topPlayer);
      }
    }
    
    console.log(`✅ Generated ${topPlayers.length} top players with real game analysis`);
    
    // Step 8: Sort by consistency and limit
    const sorted = topPlayers
      .sort((a, b) => b.overallConsistency - a.overallConsistency)
      .slice(0, MAX_TOP_PLAYERS);
    
    console.log(`🎉 Returning ${sorted.length} top players`);
    return sorted;
    
  } catch (error) {
    console.error('❌ Error in getRealTopPlayersFromSportsData:', error);
    return [];
  }
}

/**
 * Gather top candidates by position for game log analysis
 */
function gatherTopCandidates(players: SDPlayerSeason[]): SDPlayerSeason[] {
  const byPosition: Record<string, SDPlayerSeason[]> = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
  };
  
  for (const player of players) {
    const pos = normalizePosition(player.Position || '');
    if (byPosition[pos]) {
      byPosition[pos].push(player);
    }
  }
  
  // Sort each position by relevant production stat
  byPosition.QB.sort((a, b) => (b.PassingYards || 0) - (a.PassingYards || 0));
  byPosition.RB.sort((a, b) => (b.RushingYards || 0) - (a.RushingYards || 0));
  byPosition.WR.sort((a, b) => (b.ReceivingYards || 0) - (a.ReceivingYards || 0));
  byPosition.TE.sort((a, b) => (b.ReceivingYards || 0) - (a.ReceivingYards || 0));
  
  // Take top N from each position
  const candidates: SDPlayerSeason[] = [];
  for (const pos of ['QB', 'RB', 'WR', 'TE']) {
    const limit = POSITION_LIMITS[pos] || 3;
    candidates.push(...byPosition[pos].slice(0, limit));
  }
  
  return candidates;
}

/**
 * Convert season stat + game logs to TopPlayer with real analysis
 */
async function convertToTopPlayer(
  seasonStat: SDPlayerSeason,
  gameLogs: SDPlayerGame[],
  injuryMap: Map<number, SDInjury>
): Promise<TopPlayer | null> {
  try {
    const position = normalizePosition(seasonStat.Position || '');
    const playedGames = gameLogs.filter((g) => g.Played === 1);
    
    if (playedGames.length < MIN_GAMES_REQUIRED) {
      return null;
    }
    
    // Generate predictions based on real game-by-game analysis
    let rawPredictions;
    if (position === 'QB') {
      rawPredictions = analyzeQBGameLogs(playedGames, seasonStat.Name || 'Unknown');
    } else if (position === 'RB') {
      rawPredictions = analyzeRBGameLogs(playedGames, seasonStat.Name || 'Unknown');
    } else {
      rawPredictions = analyzeWRTEGameLogs(playedGames, seasonStat.Name || 'Unknown');
    }
    
    // Convert predictions to StatPrediction format expected by UI
    const stats: StatPrediction[] = rawPredictions.map((pred) => ({
      label: pred.stat,
      threshold: 0, // Not used in our display
      likelihood: pred.likelihood,
      confidence: pred.likelihood >= 75 ? 'high' : pred.likelihood >= 60 ? 'medium' : 'low',
      volatilityWarning: pred.likelihood < 60,
    }));
    
    // Calculate consistency from game logs
    const consistencyScore = calculateGameLogConsistency(playedGames, position);
    
    // Get injury status
    const injury = injuryMap.get(seasonStat.PlayerID);
    const injuryStatus = injury
      ? normalizeInjuryStatus(injury.Status || '') || 'Active'
      : 'Active';
    
    // Resolve player image
    const imageUrl = resolveImage(seasonStat);
    
    // Calculate primary metric (average per game)
    let primaryMetricLabel = '';
    let averagePerGame = 0;
    let volatility = 0;
    
    if (position === 'QB') {
      primaryMetricLabel = 'Pass Yards/Game';
      averagePerGame = Math.round((seasonStat.PassingYards || 0) / playedGames.length);
      const yards = playedGames.map((g) => g.PassingYards || 0);
      volatility = calculateCV(yards);
    } else if (position === 'RB') {
      primaryMetricLabel = 'Rush Yards/Game';
      averagePerGame = Math.round((seasonStat.RushingYards || 0) / playedGames.length);
      const yards = playedGames.map((g) => g.RushingYards || 0);
      volatility = calculateCV(yards);
    } else {
      primaryMetricLabel = 'Rec Yards/Game';
      averagePerGame = Math.round((seasonStat.ReceivingYards || 0) / playedGames.length);
      const yards = playedGames.map((g) => g.ReceivingYards || 0);
      volatility = calculateCV(yards);
    }
    
    return {
      id: seasonStat.PlayerID.toString(),
      name: seasonStat.Name || 'Unknown',
      position,
      team: seasonStat.Team || 'FA',
      teamAbbr: seasonStat.Team || 'FA',
      image: imageUrl,
      stats,
      overallConsistency: consistencyScore,
      gamesPlayed: playedGames.length,
      isStarter: (seasonStat.Started || 0) >= playedGames.length * 0.7,
      injuryStatus,
      primaryMetricLabel,
      averagePerGame,
      volatility: Math.round(volatility),
      trend: determineTrend(playedGames, position),
    };
  } catch (error) {
    console.error(`Error converting player ${seasonStat.Name}:`, error);
    return null;
  }
}

/**
 * Calculate coefficient of variation as percentage
 */
function calculateCV(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / mean) * 100;
}

/**
 * Determine trend from recent games
 */
function determineTrend(
  games: SDPlayerGame[],
  position: string
): 'increasing' | 'decreasing' | 'stable' {
  if (games.length < 3) return 'stable';
  
  // Get relevant stat values
  const values = games.map((g) => {
    if (position === 'QB') return g.PassingYards || 0;
    if (position === 'RB') return g.RushingYards || 0;
    return g.ReceivingYards || 0;
  });
  
  // Compare first half to second half
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (diff > 15) return 'increasing';
  if (diff < -15) return 'decreasing';
  return 'stable';
}

/**
 * Build injury map from injury data
 */
function buildInjuryMap(injuries: SDInjury[]): Map<number, SDInjury> {
  const map = new Map<number, SDInjury>();
  for (const injury of injuries) {
    map.set(injury.PlayerID, injury);
  }
  return map;
}

/**
 * Normalize injury status
 */
function normalizeInjuryStatus(status: string): string | undefined {
  if (!status || status === 'Scrambled') return undefined;
  const lower = status.toLowerCase().trim();
  if (lower === 'questionable') return 'Questionable';
  if (lower === 'probable') return 'Probable';
  if (lower === 'doubtful') return 'Doubtful';
  if (lower === 'out') return 'Out';
  return status;
}

/**
 * Check if injury status should exclude player
 */
function shouldExcludeInjuryStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  if (status === 'Scrambled') return false;
  const normalized = status.toLowerCase().trim();
  return EXCLUDED_INJURY_STATUSES.has(normalized);
}

/**
 * Normalize position
 */
function normalizePosition(pos: string): string {
  const normalized = pos.trim().toUpperCase();
  if (normalized === 'HB' || normalized === 'FB') return 'RB';
  return normalized;
}

/**
 * Resolve player image URL
 */
function resolveImage(player: SDPlayerSeason): string {
  // Use SportsDataIO's S3 bucket for player headshots
  // Pattern: https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/{PlayerID}.png
  return `https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`;
}
