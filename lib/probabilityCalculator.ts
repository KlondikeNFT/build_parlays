/**
 * Probability Calculator
 * Calculates the likelihood of a player achieving specific stat thresholds
 * based on their historical game log performance using normal distribution
 */

interface GameStats {
  PassingYards?: number;
  PassingTouchdowns?: number;
  PassingCompletions?: number;
  PassingAttempts?: number;
  RushingYards?: number;
  RushingAttempts?: number;
  RushingTouchdowns?: number;
  ReceivingYards?: number;
  Receptions?: number;
  ReceivingTouchdowns?: number;
  Targets?: number;
}

export interface StatThreshold {
  stat: string;
  label: string;
  min: number;
  max: number;
  step: number;
  icon: string;
}

/**
 * Get relevant stat categories based on player position
 */
export function getStatCategories(position: string): StatThreshold[] {
  const normalizedPos = position.toUpperCase();
  
  if (normalizedPos === 'QB') {
    return [
      { stat: 'PassingYards', label: 'Passing Yards', min: 0, max: 400, step: 5, icon: '🎯' },
      { stat: 'PassingTouchdowns', label: 'Passing TDs', min: 0, max: 5, step: 1, icon: '🏈' },
      { stat: 'PassingCompletions', label: 'Completions', min: 0, max: 40, step: 1, icon: '✓' },
      { stat: 'RushingYards', label: 'Rushing Yards', min: 0, max: 80, step: 5, icon: '🏃' },
    ];
  } else if (normalizedPos === 'RB') {
    return [
      { stat: 'RushingYards', label: 'Rushing Yards', min: 0, max: 200, step: 5, icon: '🏃' },
      { stat: 'RushingAttempts', label: 'Rush Attempts', min: 0, max: 30, step: 1, icon: '📊' },
      { stat: 'RushingTouchdowns', label: 'Rushing TDs', min: 0, max: 4, step: 1, icon: '🏈' },
      { stat: 'Receptions', label: 'Receptions', min: 0, max: 10, step: 1, icon: '🙌' },
      { stat: 'ReceivingYards', label: 'Receiving Yards', min: 0, max: 100, step: 5, icon: '📏' },
    ];
  } else if (normalizedPos === 'WR' || normalizedPos === 'TE') {
    return [
      { stat: 'ReceivingYards', label: 'Receiving Yards', min: 0, max: 150, step: 5, icon: '📏' },
      { stat: 'Receptions', label: 'Receptions', min: 0, max: 15, step: 1, icon: '🙌' },
      { stat: 'ReceivingTouchdowns', label: 'Receiving TDs', min: 0, max: 3, step: 1, icon: '🏈' },
      { stat: 'Targets', label: 'Targets', min: 0, max: 20, step: 1, icon: '🎯' },
    ];
  }
  
  // Default fallback
  return [
    { stat: 'ReceivingYards', label: 'Receiving Yards', min: 0, max: 150, step: 5, icon: '📏' },
    { stat: 'RushingYards', label: 'Rushing Yards', min: 0, max: 100, step: 5, icon: '🏃' },
  ];
}

/**
 * Calculate mean (average)
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate cumulative probability using normal distribution (Z-score)
 * Returns probability that a value will be >= threshold
 */
function normalCDF(z: number): number {
  // Approximation of the cumulative distribution function
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/**
 * Calculate probability of achieving a threshold
 */
export function calculateProbability(
  gameStats: GameStats[],
  stat: string,
  threshold: number
): {
  probability: number;
  mean: number;
  stdDev: number;
  games: number;
  confidence: 'high' | 'medium' | 'low';
} {
  // Extract the stat values from game logs
  const values = gameStats
    .map(game => {
      const key = stat as keyof GameStats;
      return game[key] || 0;
    })
    .filter(val => val !== undefined) as number[];
  
  if (values.length === 0) {
    // No data at all
    return {
      probability: 0,
      mean: 0,
      stdDev: 0,
      games: 0,
      confidence: 'low',
    };
  }
  
  const avg = mean(values);
  const stdDev = values.length >= 2 ? standardDeviation(values, avg) : 0;
  
  // Handle edge cases
  if (threshold === 0) {
    return {
      probability: 100,
      mean: avg,
      stdDev,
      games: values.length,
      confidence: values.length >= 8 ? 'high' : values.length >= 5 ? 'medium' : 'low',
    };
  }
  
  // With only 1 game or no variance, use simple comparison
  if (values.length === 1 || stdDev === 0) {
    const prob = threshold <= avg ? 100 : 0;
    return {
      probability: prob,
      mean: avg,
      stdDev,
      games: values.length,
      confidence: values.length >= 8 ? 'high' : values.length >= 5 ? 'medium' : 'low',
    };
  }
  
  // Calculate Z-score
  const zScore = (threshold - avg) / stdDev;
  
  // Calculate probability (probability of being >= threshold)
  const probability = (1 - normalCDF(zScore)) * 100;
  
  // Clamp between 0 and 100
  const clampedProbability = Math.max(0, Math.min(100, probability));
  
  // Determine confidence based on number of games
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (values.length >= 8) {
    confidence = 'high';
  } else if (values.length >= 5) {
    confidence = 'medium';
  }
  
  return {
    probability: Math.round(clampedProbability),
    mean: Math.round(avg * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    games: values.length,
    confidence,
  };
}

/**
 * Get recommended threshold (the value at which probability is ~50%)
 */
export function getRecommendedThreshold(
  gameStats: GameStats[],
  stat: string
): number {
  const values = gameStats
    .map(game => {
      const key = stat as keyof GameStats;
      return game[key] || 0;
    })
    .filter(val => val !== undefined) as number[];
  
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  return Math.round(avg);
}

/**
 * Calculate recent trend (last 3 games vs season average)
 */
export function calculateTrend(
  gameStats: GameStats[],
  stat: string
): 'increasing' | 'stable' | 'decreasing' {
  if (gameStats.length < 4) return 'stable';
  
  const values = gameStats
    .map(game => {
      const key = stat as keyof GameStats;
      return game[key] || 0;
    })
    .filter(val => val !== undefined) as number[];
  
  if (values.length < 4) return 'stable';
  
  // Compare last 3 games to earlier games
  const recentGames = values.slice(-3);
  const earlierGames = values.slice(0, -3);
  
  const recentAvg = mean(recentGames);
  const earlierAvg = mean(earlierGames);
  
  const percentChange = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  
  if (percentChange > 15) return 'increasing';
  if (percentChange < -15) return 'decreasing';
  return 'stable';
}

/**
 * Calculate week-to-week changes (deltas) for a stat
 */
function calculateWeekToWeekChanges(values: number[]): number[] {
  const changes: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prevValue = values[i - 1];
    const currentValue = values[i];
    if (prevValue > 0) {
      // Calculate percentage change
      const percentChange = Math.abs((currentValue - prevValue) / prevValue) * 100;
      changes.push(percentChange);
    }
  }
  return changes;
}

/**
 * Identify "off games" - games significantly below average
 */
function identifyOffGames(values: number[], average: number): {
  offGameCount: number;
  offGamePercentage: number;
  avgDropInOffGames: number;
} {
  if (values.length === 0 || average === 0) {
    return { offGameCount: 0, offGamePercentage: 0, avgDropInOffGames: 0 };
  }
  
  // Define "off game" as 30% or more below average
  const offGameThreshold = average * 0.7;
  const offGames = values.filter(val => val < offGameThreshold);
  
  // Calculate average drop in off games
  const drops = offGames.map(val => ((average - val) / average) * 100);
  const avgDrop = drops.length > 0 ? mean(drops) : 0;
  
  return {
    offGameCount: offGames.length,
    offGamePercentage: (offGames.length / values.length) * 100,
    avgDropInOffGames: avgDrop,
  };
}

/**
 * Analyze volatility for a single stat
 */
function analyzeStatVolatility(values: number[]): {
  weekToWeekAvgChange: number;
  offGameData: ReturnType<typeof identifyOffGames>;
  consistency: number;
} {
  if (values.length < 2) {
    return {
      weekToWeekAvgChange: 0,
      offGameData: { offGameCount: 0, offGamePercentage: 0, avgDropInOffGames: 0 },
      consistency: 50,
    };
  }
  
  const avg = mean(values);
  const changes = calculateWeekToWeekChanges(values);
  const weekToWeekAvgChange = changes.length > 0 ? mean(changes) : 0;
  const offGameData = identifyOffGames(values, avg);
  
  // Consistency score: lower week-to-week changes + fewer off games = higher consistency
  // 100 = perfect consistency, 0 = very inconsistent
  const changeScore = Math.max(0, 100 - weekToWeekAvgChange);
  const offGameScore = Math.max(0, 100 - offGameData.offGamePercentage * 2);
  const consistency = (changeScore * 0.6 + offGameScore * 0.4);
  
  return {
    weekToWeekAvgChange,
    offGameData,
    consistency,
  };
}

/**
 * Calculate overall volatility score for a player across multiple stats
 * Returns a score from 0-100 where:
 * - 0-30: Low volatility (very consistent)
 * - 30-60: Medium volatility (somewhat predictable)
 * - 60-100: High volatility (unpredictable)
 */
export function calculateVolatilityScore(
  gameStats: GameStats[],
  position: string
): {
  score: number;
  rating: 'Low' | 'Medium' | 'High';
  coefficientOfVariation: number;
  mean: number;
  stdDev: number;
} {
  if (gameStats.length < 2) {
    return {
      score: 50,
      rating: 'Medium',
      coefficientOfVariation: 0,
      mean: 0,
      stdDev: 0,
    };
  }
  
  // Define which stats to analyze based on position with weights
  let statsToAnalyze: { stat: string; weight: number }[] = [];
  
  if (position === 'QB') {
    statsToAnalyze = [
      { stat: 'PassingYards', weight: 0.5 },
      { stat: 'PassingTouchdowns', weight: 0.3 },
      { stat: 'PassingInterceptions', weight: 0.2 },
    ];
  } else if (position === 'RB') {
    statsToAnalyze = [
      { stat: 'RushingYards', weight: 0.5 },
      { stat: 'RushingTouchdowns', weight: 0.3 },
      { stat: 'Receptions', weight: 0.2 },
    ];
  } else if (position === 'WR' || position === 'TE') {
    statsToAnalyze = [
      { stat: 'ReceivingYards', weight: 0.5 },
      { stat: 'Receptions', weight: 0.3 },
      { stat: 'ReceivingTouchdowns', weight: 0.2 },
    ];
  } else {
    statsToAnalyze = [{ stat: 'ReceivingYards', weight: 1.0 }];
  }
  
  // Analyze each stat
  let totalConsistency = 0;
  let totalWeight = 0;
  let primaryStatMean = 0;
  let primaryStatStdDev = 0;
  let primaryStatCV = 0;
  
  for (const { stat, weight } of statsToAnalyze) {
    const values = gameStats
      .map(game => {
        const key = stat as keyof GameStats;
        return game[key] || 0;
      })
      .filter(val => val !== undefined) as number[];
    
    if (values.length < 2) continue;
    
    const analysis = analyzeStatVolatility(values);
    totalConsistency += analysis.consistency * weight;
    totalWeight += weight;
    
    // Track primary stat (first one) for display
    if (stat === statsToAnalyze[0].stat) {
      const avg = mean(values);
      const stdDev = standardDeviation(values, avg);
      primaryStatMean = avg;
      primaryStatStdDev = stdDev;
      primaryStatCV = avg > 0 ? (stdDev / avg) * 100 : 0;
    }
  }
  
  // Calculate final consistency score (0-100, higher = more consistent)
  const overallConsistency = totalWeight > 0 ? totalConsistency / totalWeight : 50;
  
  // Convert consistency to volatility score (invert: high consistency = low volatility)
  const volatilityScore = Math.round(100 - overallConsistency);
  
  let rating: 'Low' | 'Medium' | 'High' = 'Medium';
  if (volatilityScore < 35) {
    rating = 'Low';
  } else if (volatilityScore < 65) {
    rating = 'Medium';
  } else {
    rating = 'High';
  }
  
  return {
    score: volatilityScore,
    rating,
    coefficientOfVariation: Math.round(primaryStatCV * 10) / 10,
    mean: Math.round(primaryStatMean * 10) / 10,
    stdDev: Math.round(primaryStatStdDev * 10) / 10,
  };
}

