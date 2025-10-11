'use client';

import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { calculateVolatilityScore } from '@/lib/probabilityCalculator';

interface GameStats {
  Week?: number;
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

interface VolatilityChartProps {
  gameStats: GameStats[];
  position: string;
  playerName: string;
}

export default function VolatilityChart({ gameStats, position, playerName }: VolatilityChartProps) {
  // Determine primary stat based on position
  let statKey = '';
  
  if (position === 'QB') {
    statKey = 'PassingYards';
  } else if (position === 'RB') {
    statKey = 'RushingYards';
  } else if (position === 'WR' || position === 'TE') {
    statKey = 'ReceivingYards';
  } else {
    statKey = 'ReceivingYards';
  }
  
  // Calculate volatility
  const volatility = calculateVolatilityScore(gameStats, position);
  
  // Prepare chart data
  const chartData = gameStats.map((game, index) => ({
    week: game.Week || index + 1,
    value: (game as any)[statKey] || 0,
    average: volatility.mean,
  }));
  
  // Get color for volatility rating
  const getVolatilityColor = (rating: string) => {
    if (rating === 'Low') return 'text-green-600 bg-green-50 border-green-300';
    if (rating === 'Medium') return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };
  
  const getLineColor = (rating: string) => {
    if (rating === 'Low') return '#10b981'; // green
    if (rating === 'Medium') return '#eab308'; // yellow
    return '#ef4444'; // red
  };
  
  const getVolatilityIcon = (rating: string) => {
    if (rating === 'Low') return '✓';
    if (rating === 'Medium') return '~';
    return '!';
  };
  
  const getVolatilityDescription = (rating: string) => {
    if (rating === 'Low') return 'Consistent performer';
    if (rating === 'Medium') return 'Moderate variance';
    return 'High variance';
  };
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-700">Volatility</h3>
        </div>
        
        {/* Volatility Score Badge */}
        <div className={`px-2 py-1 rounded-md border ${getVolatilityColor(volatility.rating)} flex items-center space-x-1.5`}>
          <span className="text-sm font-bold">{getVolatilityIcon(volatility.rating)}</span>
          <div className="text-left">
            <div className="text-xs font-bold">{volatility.rating}</div>
            <div className="text-xs opacity-70">{volatility.score}/100</div>
          </div>
        </div>
      </div>
      
      {/* Minimalist Chart - Just the line */}
      <div className="h-20 bg-white rounded-lg p-2 border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            {/* Average line (subtle) */}
            <ReferenceLine 
              y={volatility.mean} 
              stroke="#d1d5db" 
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            
            {/* Performance line */}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={getLineColor(volatility.rating)}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        {getVolatilityDescription(volatility.rating)}
      </p>
    </div>
  );
}

