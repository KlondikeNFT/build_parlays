'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerWithStats, getFullTeamName } from '@/lib/playerService';
import { getTeamColors, getWikipediaLogoUrl } from '@/lib/teamColors';
import { ArrowLeft, CheckCircle, Activity, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import ProbabilitySlider from '@/components/ProbabilitySlider';
import InteractiveSlider from '@/components/InteractiveSlider';
import TeammatesMenu from '@/components/TeammatesMenu';
import TabNavigation from '@/components/TabNavigation';
import ChartVisualization from '@/components/ChartVisualization';
import { getStatCategories } from '@/lib/probabilityCalculator';
import { analyzePlayerPerformance, PlayerPerformanceAnalysis } from '@/lib/playerAnalyzer';


// Enhanced Interactive Slider Component (combines new design with smart data)
function EnhancedInteractiveSlider({ statAnalysis, gameStats, index, player }: { 
  statAnalysis: any; 
  gameStats: any[]; 
  index: number;
  player: any;
}) {
  const [value, setValue] = useState(statAnalysis ? Math.round(statAnalysis.suggestedThreshold) : 0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const min = Math.max(0, Math.round(statAnalysis.min * 0.5));
  const max = Math.round(statAnalysis.max * 1.5);
  
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

  // Get gradient color based on probability (using your new design colors)
  const getGradientColor = (probability: number) => {
    if (probability >= 70) {
      // High probability - Green gradient
      return 'from-[#00FF5D] to-[#00B743]';
    } else if (probability >= 40) {
      // Medium probability - Yellow gradient
      return 'from-[#EEFF00] to-[#FFEA00]';
    } else {
      // Low probability - Red gradient
      return 'from-[#FF5100] to-[#FF0000]';
    }
  };

  const probability = calculateProbability(value);
  const fillPercentage = ((value - min) / (max - min)) * 100;

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    updateValue(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    updateValue(clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    
    setValue(newValue);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
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
  }, [isDragging]);

  // Safety checks for statAnalysis
  if (!statAnalysis) {
    return <div>Loading stat analysis...</div>;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-600 font-bold text-lg">{statAnalysis.label}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-black">{probability}%</div>
          <div className="text-sm text-gray-500">Chance</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative" style={{ touchAction: 'none' }}>
        {/* Slider Track */}
        <div 
          ref={sliderRef}
          className="h-9 bg-gray-200 cursor-pointer relative"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Filled Portion */}
          <div 
            className={`h-9 bg-gradient-to-r absolute top-0 left-0 ${getGradientColor(probability)}`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-9 bg-white border-2 border-gray-300 shadow-lg cursor-pointer transition-transform ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{ 
            left: `calc(${fillPercentage}% - 12px)`,
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />

        {/* Value Bubble */}
        <div 
          className="absolute -top-8 transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${fillPercentage}%` }}
        >
          <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg border border-gray-200">
            {value}
          </div>
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
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
  const [teammates, setTeammates] = useState<any[]>([]);
  const [playerImageError, setPlayerImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('Tools');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Sorting functions
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedGameLog = () => {
    if (!sortConfig || !gameLog.length) return gameLog;

    return [...gameLog].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'week':
          aValue = a.Week || a.week || 0;
          bValue = b.Week || b.week || 0;
          break;
        case 'passing_yards':
          aValue = a.PassingYards || a.passing_yards || 0;
          bValue = b.PassingYards || b.passing_yards || 0;
          break;
        case 'passing_touchdowns':
          aValue = a.PassingTouchdowns || a.passing_touchdowns || 0;
          bValue = b.PassingTouchdowns || b.passing_touchdowns || 0;
          break;
        case 'passing_completions':
          aValue = a.PassingCompletions || a.passing_completions || 0;
          bValue = b.PassingCompletions || b.passing_completions || 0;
          break;
        case 'passing_attempts':
          aValue = a.PassingAttempts || a.passing_attempts || 0;
          bValue = b.PassingAttempts || b.passing_attempts || 0;
          break;
        case 'passing_interceptions':
          aValue = a.PassingInterceptions || a.passing_interceptions || 0;
          bValue = b.PassingInterceptions || b.passing_interceptions || 0;
          break;
        case 'rushing_attempts':
          aValue = a.RushingAttempts || a.rushing_attempts || 0;
          bValue = b.RushingAttempts || b.rushing_attempts || 0;
          break;
        case 'rushing_yards':
          aValue = a.RushingYards || a.rushing_yards || 0;
          bValue = b.RushingYards || b.rushing_yards || 0;
          break;
        case 'rushing_touchdowns':
          aValue = a.RushingTouchdowns || a.rushing_touchdowns || 0;
          bValue = b.RushingTouchdowns || b.rushing_touchdowns || 0;
          break;
        case 'targets':
          aValue = a.Targets || a.receiving_targets || 0;
          bValue = b.Targets || b.receiving_targets || 0;
          break;
        case 'receptions':
          aValue = a.Receptions || a.receptions || 0;
          bValue = b.Receptions || b.receptions || 0;
          break;
        case 'receiving_yards':
          aValue = a.ReceivingYards || a.receiving_yards || 0;
          bValue = b.ReceivingYards || b.receiving_yards || 0;
          break;
        case 'receiving_touchdowns':
          aValue = a.ReceivingTouchdowns || a.receiving_touchdowns || 0;
          bValue = b.ReceivingTouchdowns || b.receiving_touchdowns || 0;
          break;
        case 'fantasy_points':
          aValue = a.FantasyPoints || a.fantasy_points || 0;
          bValue = b.FantasyPoints || b.fantasy_points || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

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

            // Fetch teammates data based on recent game participation
            console.log('👥 Fetching teammates data based on recent game participation...');
            try {
              const teammatesResponse = await fetch(`/api/teammates?playerId=${playerId}`);
              if (teammatesResponse.ok) {
                const teammatesData = await teammatesResponse.json();
                setTeammates(teammatesData.teammates || []);
                console.log(`✅ Found ${teammatesData.teammates?.length || 0} active teammates from recent game`);
              }
            } catch (error) {
              console.error('❌ Error fetching teammates:', error);
              setTeammates([]);
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

      {/* Teammates Menu */}
      <div className="px-4 py-3 bg-white lg:px-8">
        <TeammatesMenu 
          teammates={teammates}
          currentPlayerId={playerId}
        />
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
              className="w-8 h-8 hover:scale-105 transition-transform lg:w-10 lg:h-10 rounded-md flex items-center justify-center"
            >
              {(() => {
                const wikipediaLogoUrl = getWikipediaLogoUrl(player.Team);
                if (wikipediaLogoUrl) {
                  return (
                    <Image
                      src={wikipediaLogoUrl}
                      alt={`${player.Team} logo`}
                      width={32}
                      height={32}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-md object-contain"
                    />
                  );
                } else {
                  return (
                    <div 
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-md flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${getTeamColors(player.Team).primary}, ${getTeamColors(player.Team).secondary})` }}
                    >
                      {player.Team}
                    </div>
                  );
                }
              })()}
            </Link>
          </div>
        </div>

        {/* Player Photo */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32 lg:w-40 lg:h-40">
            {playerImageError ? (
              // Show Wikipedia team logo if player image failed
              (() => {
                const wikipediaLogoUrl = getWikipediaLogoUrl(player.Team);
                if (wikipediaLogoUrl) {
                  return (
                    <Image
                      src={wikipediaLogoUrl}
                      alt={`${player.Team} logo`}
                      fill
                      className="object-contain rounded-full bg-gray-100"
                      onError={() => {
                        // Final fallback to team-colored logo
                        const teamColors = getTeamColors(player.Team);
                        const container = document.querySelector('[data-player-photo]');
                        if (container) {
                          container.innerHTML = `
                            <div class="w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-white font-bold text-2xl lg:text-3xl shadow-lg" style="background: linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary})">
                              ${player.Team}
                            </div>
                          `;
                        }
                      }}
                    />
                  );
                } else {
                  const teamColors = getTeamColors(player.Team);
                  return (
                    <div 
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-white font-bold text-2xl lg:text-3xl shadow-lg" 
                      style={{ background: `linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary})` }}
                    >
                      {player.Team}
                    </div>
                  );
                }
              })()
            ) : (
              // Try player image first
              <div data-player-photo>
                <Image
                  src={`https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`}
                  alt={`${player.FirstName} ${player.LastName}`}
                  fill
                  className="object-cover rounded-full"
                  onError={() => setPlayerImageError(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid - Dynamic based on position */}
        <div className="bg-blue-600 rounded-lg p-4 mb-6 lg:p-6">
          {stats ? (
            <div className="grid grid-cols-4 gap-3 lg:gap-4">
              {(() => {
                // Get position-specific stats
                const getPositionStats = (position: string) => {
                  switch (position) {
                    case 'QB':
                      return [
                        { value: Math.round(stats.PassingYards || 0), label: 'Pass YDS' },
                        { value: Math.round(stats.PassingTouchdowns || 0), label: 'Pass TD' },
                        { value: Math.round(stats.PassingInterceptions || 0), label: 'INT' },
                        { value: stats.PassingRating ? stats.PassingRating.toFixed(1) : '0.0', label: 'Rating' }
                      ];
                    case 'RB':
                      return [
                        { value: Math.round(stats.RushingYards || 0), label: 'Rush YDS' },
                        { value: Math.round(stats.RushingTouchdowns || 0), label: 'Rush TD' },
                        { value: Math.round(stats.RushingAttempts || 0), label: 'Att' },
                        { value: Math.round(stats.ReceivingYards || 0), label: 'Rec YDS' }
                      ];
                    case 'WR':
                    case 'TE':
                      return [
                        { value: Math.round(stats.ReceivingYards || 0), label: 'Rec YDS' },
                        { value: Math.round(stats.ReceivingTouchdowns || 0), label: 'Rec TD' },
                        { value: Math.round(stats.Receptions || 0), label: 'Rec' },
                        { value: Math.round(stats.Targets || 0), label: 'Targets' }
                      ];
                    default:
                      // For other positions, show most relevant stats
                      return [
                        { value: Math.round(stats.RushingYards || 0), label: 'Rush YDS' },
                        { value: Math.round(stats.ReceivingYards || 0), label: 'Rec YDS' },
                        { value: Math.round(stats.RushingTouchdowns || 0), label: 'Rush TD' },
                        { value: Math.round(stats.ReceivingTouchdowns || 0), label: 'Rec TD' }
                      ];
                  }
                };

                const positionStats = getPositionStats(player.Position);

                return positionStats.map((stat, index) => (
                  <div key={index} className="bg-blue-500 rounded-lg p-3 text-center lg:p-4">
                    <div className="text-white text-xs font-medium mb-1 lg:text-sm">{stat.label}</div>
                    <div className="text-white text-lg font-bold lg:text-xl">{stat.value}</div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="text-lg font-semibold mb-2">2025 Season Stats</div>
              <div className="text-sm opacity-90">No season statistics available yet</div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <TabNavigation onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'Tools' && (
          <>
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
                    <EnhancedInteractiveSlider
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
          </>
        )}

        {activeTab === 'Game Log' && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">2025 Season Game Log</h3>
              {gameLog.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th 
                          className="text-left py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('week')}
                        >
                          Week{getSortIcon('week')}
                        </th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Opponent</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Home/Away</th>
                        
                        {/* Passing Stats (for QBs primarily) */}
                        {player.Position === 'QB' && (
                          <>
                            <th className="text-center py-3 px-2 font-semibold text-gray-700">CMP/ATT</th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSort('passing_yards')}
                            >
                              Pass Yds{getSortIcon('passing_yards')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSort('passing_touchdowns')}
                            >
                              Pass TD{getSortIcon('passing_touchdowns')}
                            </th>
                            <th 
                              className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                              onClick={() => handleSort('passing_interceptions')}
                            >
                              INT{getSortIcon('passing_interceptions')}
                            </th>
                          </>
                        )}
                        
                        {/* Rushing Stats */}
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('rushing_attempts')}
                        >
                          Rush Att{getSortIcon('rushing_attempts')}
                        </th>
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('rushing_yards')}
                        >
                          Rush Yds{getSortIcon('rushing_yards')}
                        </th>
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('rushing_touchdowns')}
                        >
                          Rush TD{getSortIcon('rushing_touchdowns')}
                        </th>
                        
                        {/* Receiving Stats */}
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('targets')}
                        >
                          Targets{getSortIcon('targets')}
                        </th>
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('receptions')}
                        >
                          Rec{getSortIcon('receptions')}
                        </th>
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('receiving_yards')}
                        >
                          Rec Yds{getSortIcon('receiving_yards')}
                        </th>
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('receiving_touchdowns')}
                        >
                          Rec TD{getSortIcon('receiving_touchdowns')}
                        </th>
                        
                        <th 
                          className="text-center py-3 px-2 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleSort('fantasy_points')}
                        >
                          Fantasy Pts{getSortIcon('fantasy_points')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedGameLog().map((game, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-gray-900 font-medium">Week {game.Week || game.week}</td>
                          <td className="py-3 px-2 text-gray-900">{game.Opponent || game.opponent}</td>
                          <td className="py-3 px-2 text-gray-900">
                            {game.HomeOrAway === 'AWAY' || game.home_away === 'away' ? '@' : 'vs'} {game.Opponent || game.opponent}
                          </td>
                          
                          {/* Passing Stats (for QBs) */}
                          {player.Position === 'QB' && (
                            <>
                              <td className="py-3 px-2 text-gray-900 text-center">
                                {Math.round(game.PassingCompletions || game.passing_completions || 0)}/{Math.round(game.PassingAttempts || game.passing_attempts || 0)}
                              </td>
                              <td className="py-3 px-2 text-gray-900 text-center">
                                {Math.round(game.PassingYards || game.passing_yards || 0)}
                              </td>
                              <td className="py-3 px-2 text-gray-900 text-center">
                                {Math.round(game.PassingTouchdowns || game.passing_touchdowns || 0)}
                              </td>
                              <td className="py-3 px-2 text-gray-900 text-center">
                                {Math.round(game.PassingInterceptions || game.passing_interceptions || 0)}
                              </td>
                            </>
                          )}
                          
                          {/* Rushing Stats */}
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.RushingAttempts > 0 || game.rushing_attempts > 0 ? 'font-semibold' : 'text-gray-400'}>
                              {Math.round(game.RushingAttempts || game.rushing_attempts || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.RushingYards > 0 || game.rushing_yards > 0 ? 'font-semibold' : 'text-gray-400'}>
                              {Math.round(game.RushingYards || game.rushing_yards || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.RushingTouchdowns > 0 || game.rushing_touchdowns > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
                              {Math.round(game.RushingTouchdowns || game.rushing_touchdowns || 0)}
                            </span>
                          </td>
                          
                          {/* Receiving Stats */}
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.Targets > 0 || game.receiving_targets > 0 ? 'font-semibold' : 'text-gray-400'}>
                              {Math.round(game.Targets || game.receiving_targets || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.Receptions > 0 || game.receptions > 0 ? 'font-semibold' : 'text-gray-400'}>
                              {Math.round(game.Receptions || game.receptions || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.ReceivingYards > 0 || game.receiving_yards > 0 ? 'font-semibold' : 'text-gray-400'}>
                              {Math.round(game.ReceivingYards || game.receiving_yards || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-900 text-center">
                            <span className={game.ReceivingTouchdowns > 0 || game.receiving_touchdowns > 0 ? 'font-semibold text-green-600' : 'text-gray-400'}>
                              {Math.round(game.ReceivingTouchdowns || game.receiving_touchdowns || 0)}
                            </span>
                          </td>
                          
                          {/* Fantasy Points */}
                          <td className="py-3 px-2 text-gray-900 text-center font-semibold">
                            {game.FantasyPoints ? game.FantasyPoints.toFixed(1) : game.fantasy_points ? game.fantasy_points.toFixed(1) : '0.0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No game log data available for the 2025 season.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Volatility' && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Volatility Analysis</h3>
              <p className="text-gray-500 mb-6">Visual representation of {player.FirstName}'s performance consistency across all stats throughout the 2025 season.</p>
              
              {gameLog.length > 0 && (() => {
                // Helper function to check if a stat has meaningful data
                const hasData = (statKey: string) => {
                  return gameLog.some(game => {
                    const value = game[statKey] || 0;
                    return value > 0;
                  });
                };

                // Helper function to get total for a stat
                const getTotal = (statKey: string) => {
                  return gameLog.reduce((sum, game) => sum + (game[statKey] || 0), 0);
                };

                return (
                  <div className="space-y-8">
                    {/* Passing Stats Charts (for QBs) */}
                    {player.Position === 'QB' && (
                      <>
                        {hasData('PassingYards') && getTotal('PassingYards') > 0 && (
                          <ChartVisualization
                            title="Passing Yards"
                            data={gameLog.map(game => ({
                              Week: game.Week || game.week || 0,
                              passing_yards: game.PassingYards || game.passing_yards || 0
                            })).sort((a, b) => a.Week - b.Week)}
                            statKey="passing_yards"
                            color="#3B82F6"
                          />
                        )}
                        {hasData('PassingTouchdowns') && getTotal('PassingTouchdowns') > 0 && (
                          <ChartVisualization
                            title="Passing Touchdowns"
                            data={gameLog.map(game => ({
                              Week: game.Week || game.week || 0,
                              passing_touchdowns: game.PassingTouchdowns || game.passing_touchdowns || 0
                            })).sort((a, b) => a.Week - b.Week)}
                            statKey="passing_touchdowns"
                            color="#10B981"
                          />
                        )}
                        {hasData('PassingInterceptions') && getTotal('PassingInterceptions') > 0 && (
                          <ChartVisualization
                            title="Passing Interceptions"
                            data={gameLog.map(game => ({
                              Week: game.Week || game.week || 0,
                              passing_interceptions: game.PassingInterceptions || game.passing_interceptions || 0
                            })).sort((a, b) => a.Week - b.Week)}
                            statKey="passing_interceptions"
                            color="#EF4444"
                          />
                        )}
                      </>
                    )}
                    
                    {/* Rushing Stats Charts */}
                    {hasData('RushingYards') && getTotal('RushingYards') > 0 && (
                      <ChartVisualization
                        title="Rushing Yards"
                        data={gameLog.map(game => ({
                          Week: game.Week || game.week || 0,
                          rushing_yards: game.RushingYards || game.rushing_yards || 0
                        })).sort((a, b) => a.Week - b.Week)}
                        statKey="rushing_yards"
                        color="#8B5CF6"
                      />
                    )}
                    {hasData('RushingTouchdowns') && getTotal('RushingTouchdowns') > 0 && (
                      <ChartVisualization
                        title="Rushing Touchdowns"
                        data={gameLog.map(game => ({
                          Week: game.Week || game.week || 0,
                          rushing_touchdowns: game.RushingTouchdowns || game.rushing_touchdowns || 0
                        })).sort((a, b) => a.Week - b.Week)}
                        statKey="rushing_touchdowns"
                        color="#F59E0B"
                      />
                    )}
                    
                    {/* Receiving Stats Charts */}
                    {hasData('ReceivingYards') && getTotal('ReceivingYards') > 0 && (
                      <ChartVisualization
                        title="Receiving Yards"
                        data={gameLog.map(game => ({
                          Week: game.Week || game.week || 0,
                          receiving_yards: game.ReceivingYards || game.receiving_yards || 0
                        })).sort((a, b) => a.Week - b.Week)}
                        statKey="receiving_yards"
                        color="#06B6D4"
                      />
                    )}
                    {hasData('Receptions') && getTotal('Receptions') > 0 && (
                      <ChartVisualization
                        title="Receptions"
                        data={gameLog.map(game => ({
                          Week: game.Week || game.week || 0,
                          receptions: game.Receptions || game.receptions || 0
                        })).sort((a, b) => a.Week - b.Week)}
                        statKey="receptions"
                        color="#84CC16"
                      />
                    )}
                    {hasData('ReceivingTouchdowns') && getTotal('ReceivingTouchdowns') > 0 && (
                      <ChartVisualization
                        title="Receiving Touchdowns"
                        data={gameLog.map(game => ({
                          Week: game.Week || game.week || 0,
                          receiving_touchdowns: game.ReceivingTouchdowns || game.receiving_touchdowns || 0
                        })).sort((a, b) => a.Week - b.Week)}
                        statKey="receiving_touchdowns"
                        color="#F97316"
                      />
                    )}
                    
                    {/* Fantasy Points Chart - Always show this one */}
                    <ChartVisualization
                      title="Fantasy Points"
                      data={gameLog.map(game => ({
                        Week: game.Week || game.week || 0,
                        fantasy_points: game.FantasyPoints || game.fantasy_points || 0
                      })).sort((a, b) => a.Week - b.Week)}
                      statKey="fantasy_points"
                      color="#EC4899"
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'Patterns' && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Patterns</h3>
              <p className="text-gray-500">Performance patterns content will be added here.</p>
            </div>
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