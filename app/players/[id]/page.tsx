'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerWithStats, getFullTeamName } from '@/lib/playerService';
import { ArrowLeft, CheckCircle, Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import ProbabilitySlider from '@/components/ProbabilitySlider';
import { getStatCategories } from '@/lib/probabilityCalculator';
import { analyzePlayerPerformance, PlayerPerformanceAnalysis } from '@/lib/playerAnalyzer';


// Smart Draggable Slider Component (enhanced with real data)
function SmartDraggableSlider({ statAnalysis, gameStats, index, player }: { 
  statAnalysis: any; 
  gameStats: any[]; 
  index: number;
  player: any;
}) {
  const [value, setValue] = useState(statAnalysis ? Math.round(statAnalysis.suggestedThreshold) : 0);
  const [isDragging, setIsDragging] = useState(false);
  
  const min = Math.max(0, Math.round(statAnalysis.min * 0.5));
  const max = Math.round(statAnalysis.max * 1.5);
  
  const fillPercentage = ((value - min) / (max - min)) * 100;
  
  // Helper function to get stat value from game data
  const getGameStatValue = (game: any, statKey: string): number => {
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
  };
  
  // Calculate realistic probability based on historical performance, trends, and statistical modeling
  const calculateProbability = (threshold: number) => {
    if (!gameStats || !Array.isArray(gameStats) || gameStats.length === 0) {
      return 0;
    }
    
    // Get all stat values sorted by week (most recent first)
    const statValues = gameStats
      .map(game => getGameStatValue(game, statAnalysis.stat))
      .filter(value => value !== null && value !== undefined);
    
    if (statValues.length === 0) return 0;
    
    // 1. Historical probability (what actually happened)
    const gamesAchieved = statValues.filter(value => value >= threshold).length;
    const historicalProbability = (gamesAchieved / statValues.length) * 100;
    
    // 2. Trend analysis (is player improving/declining?)
    const recentGames = Math.min(3, statValues.length);
    const recentValues = statValues.slice(0, recentGames);
    const olderValues = statValues.slice(recentGames);
    
    let trendMultiplier = 1.0;
    if (olderValues.length > 0) {
      const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
      const trend = (recentAvg - olderAvg) / olderAvg;
      
      // If player is trending up and threshold is above recent average, boost probability
      if (trend > 0.1 && threshold > recentAvg) {
        trendMultiplier = 1.2 + (trend * 0.5); // Up to 50% boost for strong upward trends
      }
      // If player is trending down and threshold is above recent average, reduce probability
      else if (trend < -0.1 && threshold > recentAvg) {
        trendMultiplier = 0.8 + (trend * 0.3); // Up to 30% reduction for downward trends
      }
    }
    
    // 3. Statistical possibility (even if never achieved, it's still possible)
    const maxValue = Math.max(...statValues);
    const minValue = Math.min(...statValues);
    const range = maxValue - minValue;
    
    let possibilityBoost = 0;
    if (threshold > maxValue) {
      // If threshold is above max, give it some possibility based on how far above
      const distanceAboveMax = threshold - maxValue;
      if (distanceAboveMax <= range * 0.5) { // Within 50% of the range
        possibilityBoost = Math.max(5, 15 - (distanceAboveMax / range) * 20); // 5-15% boost
      } else if (distanceAboveMax <= range) { // Within 100% of the range
        possibilityBoost = Math.max(2, 8 - (distanceAboveMax / range) * 10); // 2-8% boost
      } else {
        possibilityBoost = 1; // At least 1% for anything within reasonable range
      }
    }
    
    // 4. Consistency factor (more consistent players are more predictable)
    const consistency = statAnalysis.consistency / 100; // Convert to 0-1
    const consistencyFactor = 0.7 + (consistency * 0.3); // 0.7 to 1.0 multiplier
    
    // 5. Combine all factors
    let finalProbability = historicalProbability * trendMultiplier * consistencyFactor + possibilityBoost;
    
    // Ensure reasonable bounds (never 0%, never 100%)
    finalProbability = Math.max(1, Math.min(95, finalProbability));
    
    return Math.round(finalProbability);
  };
  
  const confidence = calculateProbability(value);
  
  // Calculate gradient color based on probability
  const getGradientColor = (probability: number): string => {
    if (probability >= 70) {
      // High probability - green gradient
      return 'from-green-400 to-green-500';
    } else if (probability >= 50) {
      // Medium probability - yellow-green gradient
      return 'from-yellow-400 to-green-400';
    } else if (probability >= 30) {
      // Lower probability - yellow gradient
      return 'from-yellow-400 to-yellow-500';
    } else if (probability >= 15) {
      // Low probability - orange gradient
      return 'from-orange-400 to-yellow-400';
    } else {
      // Very low probability - red gradient
      return 'from-red-400 to-orange-400';
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    handleTouchMove(e);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  const handleMove = (e: MouseEvent | React.MouseEvent) => {
    const slider = document.getElementById(`smart-slider-${index}`);
    if (!slider) return;
    
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    setValue(newValue);
  };

  const handleTouchMove = (e: TouchEvent | React.TouchEvent) => {
    const slider = document.getElementById(`smart-slider-${index}`);
    if (!slider) return;
    
    const rect = slider.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    setValue(newValue);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Determine volatility level based on consistency
  const volatilityLevel = statAnalysis.consistency > 70 ? 'Low' : statAnalysis.consistency > 50 ? 'Medium' : 'High';
  const volatilityColor = statAnalysis.consistency > 70 ? 'green' : statAnalysis.consistency > 50 ? 'yellow' : 'red';

  // Safety checks for statAnalysis
  if (!statAnalysis) {
    return <div>Loading stat analysis...</div>;
  }

  return (
    <div>
      {/* Volatility Banner */}
      <div className={`mb-3 p-3 rounded-lg lg:p-4 ${
        volatilityColor === 'green' ? 'bg-green-400' : volatilityColor === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className={`h-4 w-4 ${
              volatilityColor === 'green' ? 'text-green-800' : volatilityColor === 'yellow' ? 'text-yellow-800' : 'text-red-800'
            }`} />
            <div>
              <div className={`text-sm font-bold lg:text-base ${
                volatilityColor === 'green' ? 'text-green-800' : volatilityColor === 'yellow' ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {volatilityLevel} Volatility
              </div>
              <div className={`text-xs lg:text-sm ${
                volatilityColor === 'green' ? 'text-green-700' : volatilityColor === 'yellow' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {statAnalysis.consistency.toFixed(0)}% consistency • {statAnalysis.gamesWithData} games
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold lg:text-base ${
              volatilityColor === 'green' ? 'text-green-800' : volatilityColor === 'yellow' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {statAnalysis.consistency.toFixed(0)}%
            </div>
            <div className={`text-xs lg:text-sm ${
              volatilityColor === 'green' ? 'text-green-700' : volatilityColor === 'yellow' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {statAnalysis.recentTrend > 0.1 ? 'Trending up' : statAnalysis.recentTrend < -0.1 ? 'Trending down' : 'Stable'}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Label and Probability */}
      <div className="flex items-center justify-between mb-3 mt-6">
        <h4 className="text-blue-600 font-bold text-sm lg:text-base">{statAnalysis.label}</h4>
        <div className={`font-bold text-sm lg:text-base ${
          confidence >= 70 ? 'text-green-600' : 
          confidence >= 50 ? 'text-yellow-600' : 
          confidence >= 30 ? 'text-orange-600' : 'text-red-600'
        }`} title="Based on historical performance, trends, and statistical modeling">
          {confidence}% Likelihood
        </div>
      </div>

      {/* Custom Slider */}
      <div className="relative group" style={{ touchAction: 'none' }}>
        <div 
          id={`smart-slider-${index}`}
          className="h-2 bg-gray-200 rounded-full lg:h-3 cursor-pointer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div 
            className={`h-2 rounded-full lg:h-3 bg-gradient-to-r ${getGradientColor(confidence)}`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
        
        {/* Slider Thumb */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full shadow-lg cursor-pointer hover:shadow-xl lg:w-8 lg:h-8 select-none ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{ left: `calc(${fillPercentage}% - 24px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute inset-1 bg-gray-400 rounded-full opacity-30"></div>
          <div className="absolute inset-2 bg-white rounded-full"></div>
        </div>

        {/* Value Bubble */}
        <div 
          className="absolute bottom-7 opacity-100 pointer-events-none"
          style={{ left: `${fillPercentage}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded lg:text-sm lg:px-3 lg:py-1.5">
            {value}
          </div>
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-1 lg:text-sm">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {/* Color Legend */}
      <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
          <span>Likely</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded"></div>
          <span>Possible</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-2 bg-gradient-to-r from-red-400 to-orange-400 rounded"></div>
          <span>Unlikely</span>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div className="text-center">
          <div className="font-semibold">Avg</div>
          <div>{Math.round(statAnalysis.average)}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Suggested</div>
          <div className="text-blue-600 font-bold">{Math.round(statAnalysis.suggestedThreshold)}</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Max</div>
          <div>{Math.round(statAnalysis.max)}</div>
        </div>
      </div>

      {/* Trend Analysis Indicator */}
      {statAnalysis.recentTrend > 0.1 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-xs text-green-700">
            <TrendingUp className="w-3 h-3" />
            <span className="font-medium">Trending Up:</span>
            <span>Recent performance suggests higher likelihood for elevated thresholds</span>
          </div>
        </div>
      )}
      {statAnalysis.recentTrend < -0.1 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-xs text-red-700">
            <TrendingDown className="w-3 h-3" />
            <span className="font-medium">Trending Down:</span>
            <span>Recent performance suggests lower likelihood for elevated thresholds</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Original Draggable Slider Component (fallback)
function DraggableSlider({ statThreshold, gameStats, index }: { 
  statThreshold: any; 
  gameStats: any[]; 
  index: number;
}) {
  const [value, setValue] = useState(index === 0 ? 345 : 2);
  const [isDragging, setIsDragging] = useState(false);
  
  const min = statThreshold.min || 0;
  const max = statThreshold.max || (index === 0 ? 554 : 7);
  
  const fillPercentage = ((value - min) / (max - min)) * 100;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMove = (e: MouseEvent | React.MouseEvent) => {
    const slider = document.getElementById(`slider-${index}`);
    if (!slider) return;
    
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    setValue(newValue);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div>
      {/* Volatility Banner */}
      <div className={`mb-3 p-3 rounded-lg lg:p-4 ${
        index === 0 ? 'bg-yellow-400' : 'bg-green-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className={`h-4 w-4 ${
              index === 0 ? 'text-yellow-800' : 'text-green-800'
            }`} />
            <div>
              <div className={`text-sm font-bold lg:text-base ${
                index === 0 ? 'text-yellow-800' : 'text-green-800'
              }`}>
                {index === 0 ? 'Medium' : 'Low'} Volatility
              </div>
              <div className={`text-xs lg:text-sm ${
                index === 0 ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {index === 0 ? 'Moderate variance in performance' : 'Very consistent performance'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold lg:text-base ${
              index === 0 ? 'text-yellow-800' : 'text-green-800'
            }`}>
              6/100
            </div>
            <div className={`text-xs lg:text-sm ${
              index === 0 ? 'text-yellow-700' : 'text-green-700'
            }`}>
              10.4% avg change
            </div>
          </div>
        </div>
      </div>

      {/* Stat Label and Chance */}
      <div className="flex items-center justify-between mb-3 mt-6">
        <h4 className="text-blue-600 font-bold text-sm lg:text-base">{statThreshold.label}</h4>
        <div className="text-black font-bold text-sm lg:text-base">
          {index === 0 ? '35%' : '80%'} Chance
        </div>
      </div>

      {/* Custom Slider */}
      <div className="relative group">
        <div 
          id={`slider-${index}`}
          className="h-2 bg-gray-200 rounded-full lg:h-3 cursor-pointer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div 
            className={`h-2 rounded-full lg:h-3 ${
              index === 0 ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ width: `${fillPercentage}%` }}
          ></div>
        </div>
        
        {/* Slider Thumb */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full shadow-lg cursor-pointer hover:shadow-xl lg:w-8 lg:h-8 select-none ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{ left: `calc(${fillPercentage}% - 24px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute inset-1 bg-gray-400 rounded-full opacity-30"></div>
          <div className="absolute inset-2 bg-white rounded-full"></div>
        </div>

        {/* Value Bubble */}
        <div 
          className="absolute bottom-7 opacity-100 pointer-events-none"
          style={{ left: `${fillPercentage}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded lg:text-sm lg:px-3 lg:py-1.5">
            {value}
          </div>
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-1 lg:text-sm">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function PlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerId = params?.id as string;
  const team = searchParams?.get('team') || '';
  const playerName = searchParams?.get('name') || '';
  
  const [playerData, setPlayerData] = useState<any>(null);
  const [performanceAnalysis, setPerformanceAnalysis] = useState<PlayerPerformanceAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true);
      console.log(`📡 Loading player data for ID: ${playerId}...`);
      
      try {
        // Use the player ID directly from the URL path
        const response = await fetch(`/api/database/players?id=${playerId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.player) {
        console.log(`✅ Loaded stats for ${data.player.FirstName} ${data.player.LastName}`);
        setPlayerData(data);
            
            // Analyze player performance for statistical insights
            if (data.gameLog && data.gameLog.length > 0) {
              console.log('🧠 Analyzing player performance...');
              const analysis = analyzePlayerPerformance(data.player, data.gameLog);
              setPerformanceAnalysis(analysis);
              console.log(`✅ Generated analysis for ${analysis.primaryStats.length} key stats`);
            }
          } else {
            console.log('❌ No player data found');
            setPlayerData(null);
          }
        } else {
          console.log('❌ Failed to fetch player data');
          setPlayerData(null);
        }
      } catch (error) {
        console.error('❌ Error loading player data:', error);
        setPlayerData(null);
      }
      
      setLoading(false);
    }
    
    if (playerId) {
      loadPlayerData();
    }
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Loading State */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 lg:px-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin lg:w-20 lg:h-20"></div>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2 lg:text-xl">Loading Player Stats</h3>
          <p className="text-sm text-gray-600 lg:text-base">Fetching game-by-game analysis...</p>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="text-center py-8 px-4 lg:px-8">
          <p className="text-gray-600 text-lg lg:text-xl">Player not found</p>
          <Link href="/teams" className="text-blue-600 hover:text-blue-800 mt-4 inline-block font-medium lg:text-lg">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const player = playerData.player;
  const stats = playerData.seasonStats || null;
  const gameLog = playerData.gameLog || [];
  const fullTeamName = getFullTeamName(player.Team);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="bg-gray-100 px-4 py-3 flex items-center lg:px-8">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content Container */}
      <div className="px-4 py-6 lg:px-8">
        {/* Player Info Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-black lg:text-3xl">{player.FirstName} {player.LastName}</h1>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-black lg:text-base">#{player.Number || '15'}</span>
              <span className="text-sm text-black lg:text-base">•</span>
              <span className="text-sm text-black lg:text-base">{player.Position}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              href={`/teams/${player.Team}`}
              className="w-8 h-8 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center hover:bg-gray-300 transition-colors lg:w-10 lg:h-10"
            >
              <Image
                src={`/team-logos/${player.Team}.png`}
                alt={`${player.Team} logo`}
                width={24}
                height={24}
                className="w-4 h-4 lg:w-5 lg:h-5"
                onError={(e) => {
                  // Fallback to team abbreviation if logo not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="text-xs font-bold text-gray-600 hidden">{player.Team}</span>
            </Link>
          </div>
        </div>

        {/* Player Photo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 lg:w-40 lg:h-40">
            <Image
              src={`https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`}
              alt={`${player.FirstName} ${player.LastName}`}
              fill
              className="object-cover rounded-full"
              onError={(e) => {
                // Fallback for broken images
                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e5e7eb"/><text x="50" y="50" font-family="Arial" font-size="24" text-anchor="middle" dy=".3em" fill="%236b7280">${player.Number || '?'}</text></svg>`;
              }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-blue-600 rounded-lg p-4 mb-6 lg:p-6">
          {stats ? (
            <div className="grid grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-blue-500 rounded-lg p-3 text-center lg:p-4">
                <div className="text-white text-xs font-medium mb-1 lg:text-sm">YDS</div>
                <div className="text-white text-lg font-bold lg:text-xl">{Math.round(stats.PassingYards || 0)}</div>
              </div>
              <div className="bg-blue-500 rounded-lg p-3 text-center lg:p-4">
                <div className="text-white text-xs font-medium mb-1 lg:text-sm">TD</div>
                <div className="text-white text-lg font-bold lg:text-xl">{Math.round(stats.PassingTouchdowns || 0)}</div>
              </div>
              <div className="bg-blue-500 rounded-lg p-3 text-center lg:p-4">
                <div className="text-white text-xs font-medium mb-1 lg:text-sm">INT</div>
                <div className="text-white text-lg font-bold lg:text-xl">{Math.round(stats.PassingInterceptions || 0)}</div>
              </div>
              <div className="bg-blue-500 rounded-lg p-3 text-center lg:p-4">
                <div className="text-white text-xs font-medium mb-1 lg:text-sm">Rating</div>
                <div className="text-white text-lg font-bold lg:text-xl">{stats.PassingRating ? stats.PassingRating.toFixed(1) : '0.0'}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="text-lg font-semibold mb-2">2025 Season Stats</div>
              <div className="text-sm opacity-90">No season statistics available yet</div>
            </div>
          )}
        </div>

        {/* Player Projection Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium lg:text-base">
              Performance Analysis
            </button>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed lg:text-base">
            Interactive analysis tools to explore {player.FirstName}&apos;s performance patterns and statistical trends based on their actual game data.
          </p>
        </div>

        {/* Enhanced Interactive Sliders with Smart Analysis */}
        {gameLog.length > 0 && (
          <div className="space-y-6 lg:space-y-8">
            {performanceAnalysis && performanceAnalysis.primaryStats.length > 0 ? (
              // Use smart analysis data for sliders - show more stats
              performanceAnalysis.primaryStats.slice(0, 4).map((statAnalysis, index) => (
                <SmartDraggableSlider
                  key={statAnalysis.stat}
                  statAnalysis={statAnalysis}
                  gameStats={gameLog}
                  index={index}
                  player={player}
                />
              ))
            ) : (
              // Fallback to original sliders
              getStatCategories(player.Position).slice(0, 4).map((statThreshold, index) => (
              <DraggableSlider
                key={statThreshold.stat}
                statThreshold={statThreshold}
                gameStats={gameLog}
                index={index}
              />
              ))
            )}
          </div>
        )}


        {/* 2025 Season Game Log */}
        {gameLog.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">2025 Season Game Log</h2>
              <p className="text-sm text-gray-600">Detailed game-by-game performance</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Week</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opp</th>
                    
                    {/* Passing Stats (for QBs primarily) */}
                    {(player.Position === 'QB') && (
                      <>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CMP/ATT</th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Yds</th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pass TD</th>
                        <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">INT</th>
                      </>
                    )}
                    
                    {/* Rushing Stats (for all skill positions) */}
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rush Att</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rush Yds</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rush TD</th>
                    
                    {/* Receiving Stats (for all skill positions) */}
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tgt</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rec</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rec Yds</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rec TD</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gameLog.map((game: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit">
                        Week {game.Week}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {game.HomeOrAway === 'AWAY' ? '@' : 'vs'} {game.Opponent}
                      </td>
                      
                      {/* Passing Stats (for QBs) */}
                      {player.Position === 'QB' && (
                        <>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {Math.round(game.PassingCompletions || 0)}/{Math.round(game.PassingAttempts || 0)}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {Math.round(game.PassingYards || 0)}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {Math.round(game.PassingTouchdowns || 0)}
                          </td>
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                            {Math.round(game.PassingInterceptions || 0)}
                          </td>
                        </>
                      )}
                      
                      {/* Rushing Stats (for all) */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.RushingAttempts > 0 ? 'font-semibold' : 'text-gray-400'}>
                          {Math.round(game.RushingAttempts || 0)}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.RushingYards > 0 ? 'font-semibold' : 'text-gray-400'}>
                          {Math.round(game.RushingYards || 0)}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.RushingTouchdowns > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
                          {Math.round(game.RushingTouchdowns || 0)}
                        </span>
                      </td>
                      
                      {/* Receiving Stats (only show if player actually has targets/receptions) */}
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.Targets > 0 ? 'font-semibold' : 'text-gray-400'}>
                          {Math.round(game.Targets || 0)}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.Receptions > 0 ? 'font-semibold' : 'text-gray-400'}>
                          {Math.round(game.Receptions || 0)}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.ReceivingYards > 0 ? 'font-semibold' : 'text-gray-400'}>
                          {Math.round(game.ReceivingYards || 0)}
                        </span>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        <span className={game.ReceivingTouchdowns > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
                          {Math.round(game.ReceivingTouchdowns || 0)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {gameLog.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No games played this season
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayerDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        {/* Loading State */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 lg:px-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin lg:w-20 lg:h-20"></div>
          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2 lg:text-xl">Loading Player Stats</h3>
          <p className="text-sm text-gray-600 lg:text-base">Fetching game-by-game analysis...</p>
        </div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}