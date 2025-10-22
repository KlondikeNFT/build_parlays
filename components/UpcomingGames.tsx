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

  useEffect(() => {
    async function fetchUpcomingGames() {
      try {
        console.log('📅 Loading upcoming games...');
        
        // First check if there are games today
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

        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        console.log(`📅 Looking for games on: ${tomorrowStr}`);
        
        // Fetch games for tomorrow
        const response = await fetch(`/api/schedule/date?date=${tomorrowStr}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Found ${data.games.length} games for tomorrow`);
          
          // Sort games by time (closest first)
          const sortedGames = data.games.sort((a: Game, b: Game) => {
            const timeA = new Date(a.gameTime).getTime();
            const timeB = new Date(b.gameTime).getTime();
            return timeA - timeB;
          });
          
          setGames(sortedGames);
        } else {
          console.log('⚠️ No upcoming games found');
          setGames([]);
        }
      } catch (error) {
        console.error('❌ Error loading upcoming games:', error);
        setGames([]);
      } finally {
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
    const date = new Date(gameTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Games</h2>
            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {games.length} {games.length === 1 ? 'Game' : 'Games'}
            </span>
          </div>
          <Link 
            href="/schedule" 
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
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
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/matchup/${game.id}`}
                className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:border-purple-300 snap-start cursor-pointer"
              >
                {/* Gradient Banner */}
                <div 
                  className="h-2 w-full rounded-t-lg"
                  style={getGradientStyle(game.awayTeam.primaryColor, game.homeTeam.primaryColor)}
                />
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {formatGameTime(game.gameTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tv className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {game.broadcast}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Week {game.week}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-center mb-4">
                    <span className="text-sm font-medium text-purple-600">
                      {formatGameDate(game.gameTime)}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between">
                    {/* Away Team */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        <Image
                          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${game.awayTeam.id.toLowerCase()}.png`}
                          alt={game.awayTeam.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hidden`}>
                          {game.awayTeam.abbr}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{game.awayTeam.name}</h3>
                        <p className="text-xs text-gray-600">
                          {game.awayTeam.record}
                        </p>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center mx-4">
                      <div className="text-sm font-bold text-gray-500">VS</div>
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center space-x-3 flex-1 justify-end">
                      <div className="flex-1 text-right min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{game.homeTeam.name}</h3>
                        <p className="text-xs text-gray-600">
                          {game.homeTeam.record}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Image
                          src={`https://a.espncdn.com/i/teamlogos/nfl/500/${game.homeTeam.id.toLowerCase()}.png`}
                          alt={game.homeTeam.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className={`w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 hidden`}>
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
