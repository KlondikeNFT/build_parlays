/**
 * Player Performance Analyzer
 * Analyzes player stats to provide statistical insights and performance patterns
 */

export interface PlayerPerformanceAnalysis {
  primaryStats: StatAnalysis[];
  confidenceLevel: number;
  volatilityScore: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface StatAnalysis {
  stat: string;
  label: string;
  average: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  consistency: number; // 0-100, higher = more consistent
  recentTrend: number; // -1 to 1, negative = declining, positive = improving
  suggestedThreshold: number;
  confidence: number; // 0-100
  gamesWithData: number;
  totalGames: number;
}


/**
 * Analyze player's game log to generate performance insights
 */
export function analyzePlayerPerformance(
  player: any,
  gameLog: any[]
): PlayerPerformanceAnalysis {
  if (!gameLog || gameLog.length === 0) {
    return getDefaultAnalysis(player);
  }

  const position = player.Position;
  const relevantStats = getRelevantStatsForPosition(position);
  
  const statAnalyses: StatAnalysis[] = [];

  // Analyze each relevant stat
  for (const stat of relevantStats) {
    const analysis = analyzeStat(gameLog, stat);
    if (analysis.gamesWithData > 0) {
      statAnalyses.push(analysis);
    }
  }

  // Sort by confidence and relevance
  statAnalyses.sort((a, b) => b.confidence - a.confidence);

  // Calculate overall metrics
  const confidenceLevel = calculateOverallConfidence(statAnalyses);
  const volatilityScore = calculateVolatilityScore(statAnalyses);
  const trend = determineOverallTrend(statAnalyses);

  return {
    primaryStats: statAnalyses.slice(0, 6), // Top 6 most relevant stats
    confidenceLevel,
    volatilityScore,
    trend
  };
}

function getRelevantStatsForPosition(position: string): string[] {
  const statsByPosition: { [key: string]: string[] } = {
    'QB': [
      'passing_yards',
      'passing_touchdowns',
      'passing_completions',
      'passing_attempts',
      'rushing_yards',
      'rushing_touchdowns'
    ],
    'RB': [
      'rushing_yards',
      'rushing_touchdowns',
      'rushing_attempts',
      'receiving_yards',
      'receiving_touchdowns',
      'receptions'
    ],
    'WR': [
      'receiving_yards',
      'receiving_touchdowns',
      'receptions',
      'receiving_targets',
      'rushing_yards'
    ],
    'TE': [
      'receiving_yards',
      'receiving_touchdowns',
      'receptions',
      'receiving_targets'
    ]
  };

  return statsByPosition[position] || ['rushing_yards', 'receiving_yards'];
}

function analyzeStat(gameLog: any[], statKey: string): StatAnalysis {
  const values = gameLog
    .map(game => getStatValue(game, statKey))
    .filter(value => value !== null && value !== undefined && value > 0);

  if (!values || values.length === 0) {
    return getEmptyStatAnalysis(statKey);
  }

  // @ts-ignore - values is guaranteed to be non-null after the check above
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  // @ts-ignore - values is guaranteed to be non-null after the check above
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues[Math.floor(sortedValues.length / 2)];
  // @ts-ignore - values is guaranteed to be non-null after the check above
  const min = Math.min(...values);
  // @ts-ignore - values is guaranteed to be non-null after the check above
  const max = Math.max(...values);
  
  // Calculate standard deviation
  // @ts-ignore - values is guaranteed to be non-null after the check above
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate consistency (lower standard deviation = higher consistency)
  const consistency = Math.max(0, 100 - (standardDeviation / average) * 100);
  
  // Calculate recent trend (last 3 games vs previous games)
  const recentGames = Math.min(3, values.length);
  const recentValues = values.slice(0, recentGames);
  const previousValues = values.slice(recentGames);
  
  let recentTrend = 0;
  if (previousValues.length > 0) {
    // @ts-ignore - recentValues and previousValues are guaranteed to be non-null
    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    // @ts-ignore - recentValues and previousValues are guaranteed to be non-null
    const previousAvg = previousValues.reduce((sum, val) => sum + val, 0) / previousValues.length;
    recentTrend = (recentAvg - previousAvg) / previousAvg;
  }

  // Suggest threshold based on performance
  // @ts-ignore - average, median, and consistency are guaranteed to be numbers
  const suggestedThreshold = calculateSuggestedThreshold(average, median, consistency);
  
  // Calculate confidence based on consistency and sample size
  // @ts-ignore - values is guaranteed to be non-null after the check above
  const confidence = Math.min(95, (consistency * 0.7) + (Math.min(values.length, 10) * 3));

  return {
    stat: statKey,
    label: getStatLabel(statKey),
    average,
    median,
    min,
    max,
    standardDeviation,
    consistency,
    recentTrend,
    suggestedThreshold,
    confidence,
    gamesWithData: values.length,
    totalGames: gameLog.length
  };
}

function getStatValue(game: any, statKey: string): number | null {
  const statMap: { [key: string]: string } = {
    'passing_yards': 'PassingYards',
    'passing_touchdowns': 'PassingTouchdowns',
    'passing_completions': 'PassingCompletions',
    'passing_attempts': 'PassingAttempts',
    'rushing_yards': 'RushingYards',
    'rushing_touchdowns': 'RushingTouchdowns',
    'rushing_attempts': 'RushingAttempts',
    'receiving_yards': 'ReceivingYards',
    'receiving_touchdowns': 'ReceivingTouchdowns',
    'receptions': 'Receptions',
    'receiving_targets': 'ReceivingTargets'
  };

  const gameKey = statMap[statKey];
  return game[gameKey] || 0;
}

function getStatLabel(statKey: string): string {
  const labels: { [key: string]: string } = {
    'passing_yards': 'Passing Yards',
    'passing_touchdowns': 'Passing TDs',
    'passing_completions': 'Completions',
    'passing_attempts': 'Pass Attempts',
    'rushing_yards': 'Rushing Yards',
    'rushing_touchdowns': 'Rushing TDs',
    'rushing_attempts': 'Rush Attempts',
    'receiving_yards': 'Receiving Yards',
    'receiving_touchdowns': 'Receiving TDs',
    'receptions': 'Receptions',
    'receiving_targets': 'Targets'
  };

  return labels[statKey] || statKey;
}

function calculateSuggestedThreshold(average: number, median: number, consistency: number): number {
  // For high consistency players, suggest closer to average
  // For volatile players, suggest lower threshold for "over" bets
  if (consistency > 70) {
    return Math.round(average * 0.85); // 85% of average for consistent players
  } else if (consistency > 50) {
    return Math.round(median * 0.8); // 80% of median for moderate consistency
  } else {
    return Math.round(average * 0.7); // 70% of average for volatile players
  }
}


function calculateOverallConfidence(statAnalyses: StatAnalysis[]): number {
  if (statAnalyses.length === 0) return 0;
  
  const totalConfidence = statAnalyses.reduce((sum, analysis) => sum + analysis.confidence, 0);
  return Math.round(totalConfidence / statAnalyses.length);
}

function calculateVolatilityScore(statAnalyses: StatAnalysis[]): number {
  if (statAnalyses.length === 0) return 50;
  
  const totalVolatility = statAnalyses.reduce((sum, analysis) => sum + (100 - analysis.consistency), 0);
  return Math.round(totalVolatility / statAnalyses.length);
}

function determineOverallTrend(statAnalyses: StatAnalysis[]): 'increasing' | 'decreasing' | 'stable' {
  if (statAnalyses.length === 0) return 'stable';
  
  const avgTrend = statAnalyses.reduce((sum, analysis) => sum + analysis.recentTrend, 0) / statAnalyses.length;
  
  if (avgTrend > 0.1) return 'increasing';
  if (avgTrend < -0.1) return 'decreasing';
  return 'stable';
}

function getEmptyStatAnalysis(statKey: string): StatAnalysis {
  return {
    stat: statKey,
    label: getStatLabel(statKey),
    average: 0,
    median: 0,
    min: 0,
    max: 0,
    standardDeviation: 0,
    consistency: 0,
    recentTrend: 0,
    suggestedThreshold: 0,
    confidence: 0,
    gamesWithData: 0,
    totalGames: 0
  };
}

function getDefaultAnalysis(player: any): PlayerPerformanceAnalysis {
  return {
    primaryStats: [],
    confidenceLevel: 0,
    volatilityScore: 50,
    trend: 'stable'
  };
}
