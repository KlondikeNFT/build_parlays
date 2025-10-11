'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calculateProbability, calculateTrend, type StatThreshold } from '@/lib/probabilityCalculator';

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

interface ProbabilitySliderProps {
  statThreshold: StatThreshold;
  gameStats: GameStats[];
  defaultValue?: number;
}

export default function ProbabilitySlider({
  statThreshold,
  gameStats,
  defaultValue,
}: ProbabilitySliderProps) {
  const { stat, label, min, max, step, icon } = statThreshold;
  
  // Calculate initial value (mean of game stats)
  const initialValue = defaultValue ?? (() => {
    const values = gameStats
      .map(game => game[stat as keyof GameStats] || 0)
      .filter(val => val !== undefined);
    const avg = values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : (max - min) / 2;
    return Math.round(avg / step) * step;
  })();
  
  const [value, setValue] = useState(initialValue);
  const [probability, setProbability] = useState(50);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Calculate probability whenever value changes
  useEffect(() => {
    const result = calculateProbability(gameStats, stat, value);
    setProbability(result.probability);
    setConfidence(result.confidence);
  }, [value, gameStats, stat]);
  
  // Get trend for this stat
  const trend = calculateTrend(gameStats, stat);
  
  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return 'text-green-600';
    if (prob >= 50) return 'text-yellow-600';
    if (prob >= 30) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getProbabilityBg = (prob: number) => {
    if (prob >= 70) return 'bg-green-500';
    if (prob >= 50) return 'bg-yellow-500';
    if (prob >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getTrendIcon = () => {
    if (trend === 'increasing') return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend === 'decreasing') return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };
  
  // Calculate percentage for slider fill
  const fillPercentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
            <div className="flex items-center space-x-1 mt-0.5">
              {getTrendIcon()}
              <span className="text-xs text-gray-500">
                {trend === 'increasing' ? '↑' : trend === 'decreasing' ? '↓' : '→'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">Target</div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getProbabilityColor(probability)}`}>
              {probability}%
            </div>
            <div className="text-xs text-gray-500">Chance</div>
          </div>
        </div>
      </div>
      
      {/* Slider */}
      <div className="relative pt-1">
        {/* Background track with fill */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
          <div 
            className={`absolute left-0 top-0 h-full ${getProbabilityBg(probability)} transition-all duration-200`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
        
        {/* Actual slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute top-0 left-0 w-full cursor-pointer"
          style={{ 
            zIndex: 10,
            height: '24px',
            opacity: 0
          }}
        />
        
        {/* Min/Max labels */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

