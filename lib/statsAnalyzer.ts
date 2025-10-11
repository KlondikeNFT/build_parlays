/**
 * Statistical Analysis Engine for NFL Player Performance
 * Calculates averages, volatility, trends, and likelihood predictions
 */

export interface GameStats {
  week: number;
  opponent: string;
  [key: string]: any; // Flexible for different stat types
}

export interface PlayerSeasonStats {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  games: GameStats[];
  totals: Record<string, number>;
  averages: Record<string, number>;
  volatility: Record<string, number>;
  consistency: Record<string, number>;
  trends: Record<string, 'increasing' | 'decreasing' | 'stable'>;
}

export interface StatPrediction {
  label: string;
  threshold: number;
  likelihood: number;
  confidence: 'high' | 'medium' | 'low';
  volatilityWarning: boolean;
}

export interface TopPlayer {
  id: string;
  name: string;
  team: string;
  teamAbbr: string;
  position: string;
  image: string;
  stats: StatPrediction[];
  overallConsistency: number;
  gamesPlayed: number;
  isStarter: boolean;
  injuryStatus: string;
  primaryMetricLabel: string;
  averagePerGame: number;
  volatility: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Calculate mean (average) of an array of numbers
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation (measure of volatility)
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Calculate coefficient of variation (CV) - normalized volatility measure
 * Lower CV = more consistent
 */
export function calculateCV(values: number[]): number {
  const mean = calculateMean(values);
  if (mean === 0) return 0;
  const stdDev = calculateStdDev(values);
  return (stdDev / mean) * 100; // Returns as percentage
}

/**
 * Calculate consistency score (0-100, higher is better)
 * Based on coefficient of variation - inverted so lower volatility = higher score
 */
export function calculateConsistency(values: number[]): number {
  const cv = calculateCV(values);
  // Cap CV at 100 for calculation purposes
  const cappedCV = Math.min(cv, 100);
  // Invert so low CV = high consistency score
  return 100 - cappedCV;
}

/**
 * Detect trend in performance over time
 */
export function detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 3) return 'stable';
  
  // Simple linear regression slope
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const meanX = calculateMean(indices);
  const meanY = calculateMean(values);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (indices[i] - meanX) * (values[i] - meanY);
    denominator += Math.pow(indices[i] - meanX, 2);
  }
  
  const slope = numerator / denominator;
  
  // Determine trend based on slope
  if (slope > 0.1) return 'increasing';
  if (slope < -0.1) return 'decreasing';
  return 'stable';
}

/**
 * Calculate likelihood of achieving a stat threshold
 * Based on historical performance and consistency
 */
export function calculateLikelihood(
  values: number[],
  threshold: number
): number {
  if (values.length === 0) return 0;
  
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);
  
  // Count how many times player exceeded threshold
  const successCount = values.filter(v => v >= threshold).length;
  const successRate = (successCount / values.length) * 100;
  
  // Factor in consistency - more consistent = more reliable prediction
  const consistency = calculateConsistency(values);
  
  // Calculate z-score (how many std devs above mean is the threshold)
  const zScore = stdDev > 0 ? (threshold - mean) / stdDev : 0;
  
  // Combine success rate with statistical likelihood
  // Weight: 70% historical success rate, 30% consistency adjustment
  let likelihood = successRate * 0.7;
  
  // Adjust based on consistency
  const consistencyFactor = consistency / 100;
  likelihood += (successRate * consistencyFactor * 0.3);
  
  // If threshold is way above average (z-score > 2), reduce likelihood
  if (zScore > 2) {
    likelihood *= 0.7;
  } else if (zScore > 1) {
    likelihood *= 0.85;
  }
  
  // Cap between 0-100
  return Math.max(0, Math.min(100, Math.round(likelihood)));
}

/**
 * Analyze receiving stats for a player
 */
export function analyzeReceivingStats(games: GameStats[]) {
  const receptions = games.map(g => g.receptions || 0);
  const yards = games.map(g => g.yards || 0);
  const targets = games.map(g => g.targets || 0);
  const tds = games.map(g => g.touchdowns || 0);
  const firstDowns = games.map(g => g.firstDowns || 0);
  
  return {
    receptions: {
      values: receptions,
      average: calculateMean(receptions),
      volatility: calculateCV(receptions),
      consistency: calculateConsistency(receptions),
      trend: detectTrend(receptions),
    },
    yards: {
      values: yards,
      average: calculateMean(yards),
      volatility: calculateCV(yards),
      consistency: calculateConsistency(yards),
      trend: detectTrend(yards),
    },
    targets: {
      values: targets,
      average: calculateMean(targets),
      volatility: calculateCV(targets),
      consistency: calculateConsistency(targets),
      trend: detectTrend(targets),
    },
    touchdowns: {
      values: tds,
      average: calculateMean(tds),
      volatility: calculateCV(tds),
      consistency: calculateConsistency(tds),
      trend: detectTrend(tds),
    },
    firstDowns: {
      values: firstDowns,
      average: calculateMean(firstDowns),
      volatility: calculateCV(firstDowns),
      consistency: calculateConsistency(firstDowns),
      trend: detectTrend(firstDowns),
    },
  };
}

/**
 * Analyze rushing stats for a player
 */
export function analyzeRushingStats(games: GameStats[]) {
  const attempts = games.map(g => g.attempts || 0);
  const yards = games.map(g => g.yards || 0);
  const tds = games.map(g => g.touchdowns || 0);
  const firstDowns = games.map(g => g.firstDowns || 0);
  
  return {
    attempts: {
      values: attempts,
      average: calculateMean(attempts),
      volatility: calculateCV(attempts),
      consistency: calculateConsistency(attempts),
      trend: detectTrend(attempts),
    },
    yards: {
      values: yards,
      average: calculateMean(yards),
      volatility: calculateCV(yards),
      consistency: calculateConsistency(yards),
      trend: detectTrend(yards),
    },
    touchdowns: {
      values: tds,
      average: calculateMean(tds),
      volatility: calculateCV(tds),
      consistency: calculateConsistency(tds),
      trend: detectTrend(tds),
    },
    firstDowns: {
      values: firstDowns,
      average: calculateMean(firstDowns),
      volatility: calculateCV(firstDowns),
      consistency: calculateConsistency(firstDowns),
      trend: detectTrend(firstDowns),
    },
  };
}

/**
 * Analyze passing stats for a player
 */
export function analyzePassingStats(games: GameStats[]) {
  const attempts = games.map(g => g.attempts || 0);
  const completions = games.map(g => g.completions || 0);
  const yards = games.map(g => g.yards || 0);
  const tds = games.map(g => g.touchdowns || 0);
  const interceptions = games.map(g => g.interceptions || 0);
  
  return {
    attempts: {
      values: attempts,
      average: calculateMean(attempts),
      volatility: calculateCV(attempts),
      consistency: calculateConsistency(attempts),
      trend: detectTrend(attempts),
    },
    completions: {
      values: completions,
      average: calculateMean(completions),
      volatility: calculateCV(completions),
      consistency: calculateConsistency(completions),
      trend: detectTrend(completions),
    },
    yards: {
      values: yards,
      average: calculateMean(yards),
      volatility: calculateCV(yards),
      consistency: calculateConsistency(yards),
      trend: detectTrend(yards),
    },
    touchdowns: {
      values: tds,
      average: calculateMean(tds),
      volatility: calculateCV(tds),
      consistency: calculateConsistency(tds),
      trend: detectTrend(tds),
    },
    interceptions: {
      values: interceptions,
      average: calculateMean(interceptions),
      volatility: calculateCV(interceptions),
      consistency: calculateConsistency(interceptions),
      trend: detectTrend(interceptions),
    },
  };
}

/**
 * Generate stat predictions for a player based on their position
 */
export function generatePredictions(
  position: string,
  stats: any,
  gamesPlayed: number
): StatPrediction[] {
  const predictions: StatPrediction[] = [];
  
  // Only generate predictions if player has played at least 3 games
  if (gamesPlayed < 3) return predictions;
  
  if (position === 'WR' || position === 'TE') {
    // Receiving yards predictions
    const yardsAvg = stats.yards?.average || 0;
    if (yardsAvg > 40) {
      const threshold = Math.floor(yardsAvg * 0.85 / 10) * 10; // Round to nearest 10
      const likelihood = calculateLikelihood(stats.yards.values, threshold);
      predictions.push({
        label: `${threshold}+ Receiving Yards`,
        threshold,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.yards.volatility > 50,
      });
    }
    
    // Receptions predictions
    const recAvg = stats.receptions?.average || 0;
    if (recAvg > 2) {
      const threshold = Math.floor(recAvg * 0.8);
      const likelihood = calculateLikelihood(stats.receptions.values, threshold);
      predictions.push({
        label: `${threshold}+ Receptions`,
        threshold,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.receptions.volatility > 50,
      });
    }
    
    // TD predictions
    const tdAvg = stats.touchdowns?.average || 0;
    if (tdAvg > 0.3) {
      const likelihood = calculateLikelihood(stats.touchdowns.values, 1);
      predictions.push({
        label: '1+ Receiving TD',
        threshold: 1,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.touchdowns.volatility > 80,
      });
    }
  } else if (position === 'RB') {
    // Rushing yards predictions
    const yardsAvg = stats.yards?.average || 0;
    if (yardsAvg > 40) {
      const threshold = Math.floor(yardsAvg * 0.85 / 10) * 10;
      const likelihood = calculateLikelihood(stats.yards.values, threshold);
      predictions.push({
        label: `${threshold}+ Rushing Yards`,
        threshold,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.yards.volatility > 50,
      });
    }
    
    // TD predictions
    const tdAvg = stats.touchdowns?.average || 0;
    if (tdAvg > 0.3) {
      const likelihood = calculateLikelihood(stats.touchdowns.values, 1);
      predictions.push({
        label: '1+ Touchdown',
        threshold: 1,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.touchdowns.volatility > 80,
      });
    }
  } else if (position === 'QB') {
    // Passing yards predictions
    const yardsAvg = stats.yards?.average || 0;
    if (yardsAvg > 150) {
      const threshold = Math.floor(yardsAvg * 0.85 / 25) * 25; // Round to nearest 25
      const likelihood = calculateLikelihood(stats.yards.values, threshold);
      predictions.push({
        label: `${threshold}+ Passing Yards`,
        threshold,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.yards.volatility > 30,
      });
    }
    
    // TD predictions
    const tdAvg = stats.touchdowns?.average || 0;
    if (tdAvg > 1) {
      const threshold = Math.floor(tdAvg * 0.8);
      const likelihood = calculateLikelihood(stats.touchdowns.values, threshold);
      predictions.push({
        label: `${threshold}+ Passing TDs`,
        threshold,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.touchdowns.volatility > 50,
      });
    }
    
    // Interception predictions (inverse - want 0)
    const intAvg = stats.interceptions?.average || 0;
    if (intAvg < 1.5) {
      const likelihood = calculateLikelihood(
        stats.interceptions.values.map(v => (v === 0 ? 1 : 0)),
        1
      );
      predictions.push({
        label: '0 Interceptions',
        threshold: 0,
        likelihood,
        confidence: likelihood >= 70 ? 'high' : likelihood >= 60 ? 'medium' : 'low',
        volatilityWarning: stats.interceptions.volatility > 80,
      });
    }
  }
  
  return predictions.slice(0, 3); // Return top 3 predictions
}

/**
 * Calculate overall consistency score for a player
 */
export function calculateOverallConsistency(stats: any): number {
  const consistencyScores: number[] = [];
  
  Object.values(stats).forEach((stat: any) => {
    if (stat.consistency !== undefined) {
      consistencyScores.push(stat.consistency);
    }
  });
  
  if (consistencyScores.length === 0) return 0;
  return Math.round(calculateMean(consistencyScores));
}


