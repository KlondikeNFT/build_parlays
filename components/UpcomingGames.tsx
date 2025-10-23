'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Tv, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Game {
  id: string;
  week: number;
  homeTeam: {
    id: string;
    name: string;
    abbr: string;
    primaryColor: string;
    secondaryColor: string;
    record: string;
    wins: number;
    losses: number;
    ties: number;
  };
  awayTeam: {
    id: string;
    name: string;
    abbr: string;
    primaryColor: string;
    secondaryColor: string;
    record: string;
    wins: number;
    losses: number;
    ties: number;
  };
  gameTime: string;
  broadcast: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'final';
}

interface UpcomingGamesProps {
  className?: string;
}

export default function UpcomingGames({ className = '' }: UpcomingGamesProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTodaysGames, setHasTodaysGames] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    async function fetchUpcomingGames() {
      try {
        console.log('📅 Loading upcoming games... [UPDATED LOGIC v3 - ' + new Date().toISOString() + ']');
        
        // Check if there are games today first
        const todayResponse = await fetch('/api/schedule/today');
        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          setHasTodaysGames(todayData.games.length > 0);
          
          // If there are games today, don't show upcoming games
          if (todayData.games.length > 0) {
            console.log('📅 Games today found, not showing upcoming games');
            setGames([]);
            setLoading(false);
            return;
          }
        }

        // ULTRA SIMPLE: Just check tomorrow (October 23rd) and STOP
        const now = new Date();
        const todayET = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        const todayStr = todayET.toISOString().split('T')[0];
        console.log(`📅 Today is: ${todayStr}`);
        
        // Check tomorrow first (October 23rd) - THIS IS THE ONLY CHECK
        const tomorrow = new Date(todayET);
        tomorrow.setDate(todayET.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        console.log(`📅 Checking ONLY tomorrow: ${tomorrowStr}`);
        const tomorrowResponse = await fetch(`/api/schedule/date?date=${tomorrowStr}`);
        if (tomorrowResponse.ok) {
          const tomorrowData = await tomorrowResponse.json();
          console.log(`📊 Tomorrow has ${tomorrowData.games.length} games`);
          if (tomorrowData.games.length > 0) {
            console.log(`✅ Found ${tomorrowData.games.length} games for tomorrow - STOPPING HERE`);
            setGames(tomorrowData.games);
            setLoading(false);
            return;
          }
        }
        
        // If no games tomorrow, check the next few days (but limit to 3 days to avoid Sunday games)
        for (let i = 2; i <= 4; i++) {
          const checkDate = new Date(todayET);
          checkDate.setDate(todayET.getDate() + i);
          const checkDateStr = checkDate.toISOString().split('T')[0];
          
          console.log(`📅 Checking ${checkDateStr}`);
          const response = await fetch(`/api/schedule/date?date=${checkDateStr}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`📊 ${checkDateStr} has ${data.games.length} games`);
            if (data.games.length > 0) {
              console.log(`✅ Found ${data.games.length} games for ${checkDateStr} - STOPPING HERE`);
              setGames(data.games);
              setLoading(false);
              return;
            }
          }
        }
        
        // No games found
        console.log('⚠️ No upcoming games found');
        setGames([]);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error loading upcoming games:', error);
        setGames([]);
        setLoading(false);
      }
    }

    fetchUpcomingGames();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Don't render if loading, no games, or if there are games today
  if (loading) return null;
  if (games.length === 0) return null;
  if (hasTodaysGames) return null;

  const formatGameTime = (gameTime: string) => {
    const date = new Date(gameTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatGameDate = (gameTime: string) => {
    // Parse the game date from the API response (format: 2025-10-23T20:15:00)
    const gameDate = new Date(gameTime);
    
    // Get today's date in Eastern Time
    const today = new Date();
    const todayET = new Date(today.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const tomorrow = new Date(todayET);
    tomorrow.setDate(todayET.getDate() + 1);
    const dayAfterTomorrow = new Date(todayET);
    dayAfterTomorrow.setDate(todayET.getDate() + 2);
    
    // Compare dates (ignoring time)
    const gameDateStr = gameDate.toDateString();
    const tomorrowStr = tomorrow.toDateString();
    const dayAfterTomorrowStr = dayAfterTomorrow.toDateString();
    
    if (gameDateStr === tomorrowStr) {
      return 'Tomorrow';
    } else if (gameDateStr === dayAfterTomorrowStr) {
      return 'Day After Tomorrow';
    }
    
    return gameDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradientStyle = (awayColor: string, homeColor: string) => {
    return {
      background: `linear-gradient(90deg, ${awayColor} 0%, #ffffff 50%, ${homeColor} 100%)`
    };
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="p-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Games</h2>
            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {games.length} {games.length === 1 ? 'Game' : 'Games'}
            </span>
          </div>
          <Link 
            href="/schedule" 
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors whitespace-nowrap"
          >
            <span>View Full Schedule</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Scrollable Games Container */}
        <div className="relative">
          {/* Scroll Buttons */}
          {games.length > 1 && (
            <>
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-shadow"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full shadow-lg border border-gray-200 p-2 hover:shadow-xl transition-shadow"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}

        {/* Games List */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/matchup/${game.id}`}
                className="flex-shrink-0 w-80 sm:w-96 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:border-purple-300 snap-start cursor-pointer"
              >
                {/* Gradient Banner */}
                <div 
                  className="h-2 w-full rounded-t-lg"
                  style={getGradientStyle(game.awayTeam.primaryColor, game.homeTeam.primaryColor)}
                />
                
                <div className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {formatGameTime(game.gameTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tv className="w-4 h-4 text-gray-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {game.broadcast}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-500">Week {game.week}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium text-purple-600">
                      {formatGameDate(game.gameTime)}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    {/* Away Team */}
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Image
                          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${game.awayTeam.id.toLowerCase()}.png`}
                          alt={game.awayTeam.name}
                          width={24}
                          height={24}
                          className="rounded-full sm:w-8 sm:h-8"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hidden`}>
                          {game.awayTeam.abbr}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-xs truncate">{game.awayTeam.name}</h3>
                        <p className="text-xs text-gray-600">
                          {game.awayTeam.record}
                        </p>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center mx-1 sm:mx-2 flex-shrink-0">
                      <div className="text-xs font-bold text-gray-500">VS</div>
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0 justify-end">
                      <div className="flex-1 text-right min-w-0">
                        <h3 className="font-semibold text-gray-900 text-xs truncate">{game.homeTeam.name}</h3>
                        <p className="text-xs text-gray-600">
                          {game.homeTeam.record}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Image
                          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${game.homeTeam.id.toLowerCase()}.png`}
                          alt={game.homeTeam.name}
                          width={24}
                          height={24}
                          className="rounded-full sm:w-8 sm:h-8"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hidden`}>
                          {game.homeTeam.abbr}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile scroll hint */}
        {games.length > 1 && (
          <div className="md:hidden text-center mt-4 text-sm text-gray-500">
            ← Scroll to see more games →
          </div>
        )}
      </div>
    </div>
  );
}
