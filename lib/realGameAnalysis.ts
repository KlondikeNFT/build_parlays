/**
 * Real Game-by-Game Analysis
 * Analyzes actual week-to-week player performance from real game logs
 */

import type { SDPlayerGame } from './sportsdataio';
import type { TopPlayer, Prediction } from './statsAnalyzer';

interface GameLogStats {
  games: number;
  average: number;
  stdDev: number;
  coefficientOfVariation: number;
  min: number;
  max: number;
  median: number;
  consistency: number;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate median
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Analyze a stat across all games
 */
function analyzeStatAcrossGames(
  games: SDPlayerGame[],
  statGetter: (game: SDPlayerGame) => number
): GameLogStats {
  const values = games
    .filter((g) => g.Played === 1) // Only games they actually played
    .map(statGetter)
    .filter((v) => v !== null && v !== undefined);

  if (values.length === 0) {
    return {
      games: 0,
      average: 0,
      stdDev: 0,
      coefficientOfVariation: 0,
      min: 0,
      max: 0,
      median: 0,
      consistency: 0,
    };
  }

  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = calculateStdDev(values, average);
  const coefficientOfVariation = average > 0 ? (stdDev / average) * 100 : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const median = calculateMedian(values);

  // Consistency: lower CV = more consistent
  // CV < 20% = very consistent (95+ score)
  // CV 20-40% = consistent (80-94 score)
  // CV 40-60% = moderately consistent (60-79 score)
  // CV > 60% = inconsistent (<60 score)
  let consistency = 100;
  if (coefficientOfVariation > 60) {
    consistency = Math.max(30, 60 - (coefficientOfVariation - 60) * 0.5);
  } else if (coefficientOfVariation > 40) {
    consistency = 60 + ((60 - coefficientOfVariation) / 20) * 20;
  } else if (coefficientOfVariation > 20) {
    consistency = 80 + ((40 - coefficientOfVariation) / 20) * 15;
  } else {
    consistency = 95 + (20 - coefficientOfVariation) * 0.25;
  }

  return {
    games: values.length,
    average,
    stdDev,
    coefficientOfVariation,
    min,
    max,
    median,
    consistency: Math.round(consistency),
  };
}

/**
 * Generate QB predictions from real game logs
 */
export function analyzeQBGameLogs(
  games: SDPlayerGame[],
  playerName: string
): Prediction[] {
  const passingYards = analyzeStatAcrossGames(games, (g) => g.PassingYards || 0);
  const passingTDs = analyzeStatAcrossGames(games, (g) => g.PassingTouchdowns || 0);
  const ints = analyzeStatAcrossGames(games, (g) => g.PassingInterceptions || 0);

  const predictions: Prediction[] = [];

  // Passing Yards Prediction
  if (passingYards.games >= 4) {
    // Use median or 85% of average (whichever is more conservative)
    const conservativeTarget = Math.min(
      passingYards.median,
      passingYards.average * 0.85
    );
    const target = Math.round(conservativeTarget / 10) * 10; // Round to nearest 10

    // Likelihood based on how often they hit this target
    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.PassingYards || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / passingYards.games) * 100;

    // Adjust likelihood based on consistency
    const adjustedLikelihood = Math.min(
      85,
      hitRate * (passingYards.consistency / 100)
    );

    predictions.push({
      stat: `${target}+ Passing Yards`,
      likelihood: Math.round(adjustedLikelihood),
      basis: `${playerName} averages ${Math.round(passingYards.average)} yards (CV: ${Math.round(passingYards.coefficientOfVariation)}%)`,
    });
  }

  // Passing TD Prediction
  if (passingTDs.games >= 4 && passingTDs.average >= 1) {
    const target = Math.max(1, Math.floor(passingTDs.average * 0.8));
    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.PassingTouchdowns || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / passingTDs.games) * 100;
    const adjustedLikelihood = Math.min(85, hitRate * (passingTDs.consistency / 100));

    predictions.push({
      stat: `${target}+ Passing TD${target > 1 ? 's' : ''}`,
      likelihood: Math.round(adjustedLikelihood),
      basis: `${playerName} averages ${passingTDs.average.toFixed(1)} TDs per game`,
    });
  }

  // Interceptions Prediction
  if (ints.games >= 4) {
    const target = Math.ceil(ints.average);
    const timesBelowTarget = games.filter(
      (g) => g.Played === 1 && (g.PassingInterceptions || 0) <= target
    ).length;
    const hitRate = (timesBelowTarget / ints.games) * 100;

    predictions.push({
      stat: `${target} or Fewer INT${target > 1 ? 's' : ''}`,
      likelihood: Math.round(Math.min(80, hitRate * 0.9)),
      basis: `${playerName} averages ${ints.average.toFixed(1)} INTs per game`,
    });
  }

  return predictions.slice(0, 3);
}

/**
 * Generate RB predictions from real game logs
 */
export function analyzeRBGameLogs(
  games: SDPlayerGame[],
  playerName: string
): Prediction[] {
  const rushingYards = analyzeStatAcrossGames(games, (g) => g.RushingYards || 0);
  const rushingTDs = analyzeStatAcrossGames(games, (g) => g.RushingTouchdowns || 0);
  const receptions = analyzeStatAcrossGames(games, (g) => g.Receptions || 0);

  const predictions: Prediction[] = [];

  // Rushing Yards
  if (rushingYards.games >= 4) {
    const conservativeTarget = Math.min(
      rushingYards.median,
      rushingYards.average * 0.85
    );
    const target = Math.round(conservativeTarget / 5) * 5; // Round to nearest 5

    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.RushingYards || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / rushingYards.games) * 100;
    const adjustedLikelihood = Math.min(85, hitRate * (rushingYards.consistency / 100));

    predictions.push({
      stat: `${target}+ Rushing Yards`,
      likelihood: Math.round(adjustedLikelihood),
      basis: `${playerName} averages ${Math.round(rushingYards.average)} yards (CV: ${Math.round(rushingYards.coefficientOfVariation)}%)`,
    });
  }

  // Touchdowns
  if (rushingTDs.games >= 4 && rushingTDs.average >= 0.4) {
    const target = 1;
    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.RushingTouchdowns || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / rushingTDs.games) * 100;

    predictions.push({
      stat: '1+ Touchdown',
      likelihood: Math.round(Math.min(75, hitRate * 0.95)),
      basis: `${playerName} scores in ${Math.round((rushingTDs.average / rushingTDs.games) * 100)}% of games`,
    });
  }

  // Receptions (for pass-catching backs)
  if (receptions.games >= 4 && receptions.average >= 2) {
    const target = Math.max(2, Math.floor(receptions.average * 0.8));
    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.Receptions || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / receptions.games) * 100;

    predictions.push({
      stat: `${target}+ Receptions`,
      likelihood: Math.round(Math.min(80, hitRate * (receptions.consistency / 100))),
      basis: `${playerName} averages ${receptions.average.toFixed(1)} catches per game`,
    });
  }

  return predictions.slice(0, 3);
}

/**
 * Generate WR/TE predictions from real game logs
 */
export function analyzeWRTEGameLogs(
  games: SDPlayerGame[],
  playerName: string
): Prediction[] {
  const receivingYards = analyzeStatAcrossGames(games, (g) => g.ReceivingYards || 0);
  const receptions = analyzeStatAcrossGames(games, (g) => g.Receptions || 0);
  const receivingTDs = analyzeStatAcrossGames(games, (g) => g.ReceivingTouchdowns || 0);

  const predictions: Prediction[] = [];

  // Receiving Yards
  if (receivingYards.games >= 4) {
    const conservativeTarget = Math.min(
      receivingYards.median,
      receivingYards.average * 0.85
    );
    const target = Math.round(conservativeTarget / 5) * 5; // Round to nearest 5

    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.ReceivingYards || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / receivingYards.games) * 100;
    const adjustedLikelihood = Math.min(
      85,
      hitRate * (receivingYards.consistency / 100)
    );

    predictions.push({
      stat: `${target}+ Receiving Yards`,
      likelihood: Math.round(adjustedLikelihood),
      basis: `${playerName} averages ${Math.round(receivingYards.average)} yards (CV: ${Math.round(receivingYards.coefficientOfVariation)}%)`,
    });
  }

  // Receptions
  if (receptions.games >= 4) {
    const target = Math.max(3, Math.floor(receptions.average * 0.8));
    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.Receptions || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / receptions.games) * 100;

    predictions.push({
      stat: `${target}+ Receptions`,
      likelihood: Math.round(Math.min(85, hitRate * (receptions.consistency / 100))),
      basis: `${playerName} averages ${receptions.average.toFixed(1)} catches per game`,
    });
  }

  // Receiving TDs
  if (receivingTDs.games >= 4 && receivingTDs.average >= 0.35) {
    const target = 1;
    const timesAboveTarget = games.filter(
      (g) => g.Played === 1 && (g.ReceivingTouchdowns || 0) >= target
    ).length;
    const hitRate = (timesAboveTarget / receivingTDs.games) * 100;

    predictions.push({
      stat: '1+ Receiving TD',
      likelihood: Math.round(Math.min(70, hitRate * 0.9)),
      basis: `${playerName} scores in ${Math.round((receivingTDs.average / receivingTDs.games) * 100)}% of games`,
    });
  }

  return predictions.slice(0, 3);
}

/**
 * Calculate overall consistency from game logs
 */
export function calculateGameLogConsistency(
  games: SDPlayerGame[],
  position: string
): number {
  if (games.length < 4) return 50;

  let totalConsistency = 0;
  let statCount = 0;

  if (position === 'QB') {
    const yards = analyzeStatAcrossGames(games, (g) => g.PassingYards || 0);
    const tds = analyzeStatAcrossGames(games, (g) => g.PassingTouchdowns || 0);
    totalConsistency += yards.consistency + tds.consistency;
    statCount += 2;
  } else if (position === 'RB') {
    const yards = analyzeStatAcrossGames(games, (g) => g.RushingYards || 0);
    const recs = analyzeStatAcrossGames(games, (g) => g.Receptions || 0);
    totalConsistency += yards.consistency + recs.consistency;
    statCount += 2;
  } else {
    const yards = analyzeStatAcrossGames(games, (g) => g.ReceivingYards || 0);
    const recs = analyzeStatAcrossGames(games, (g) => g.Receptions || 0);
    totalConsistency += yards.consistency + recs.consistency;
    statCount += 2;
  }

  // Bonus for more games played
  const gamesPlayed = games.filter((g) => g.Played === 1).length;
  const gameBonus = Math.min(10, gamesPlayed);

  return Math.min(98, Math.round(totalConsistency / statCount) + gameBonus);
}



