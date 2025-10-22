'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Tv, Users, ExternalLink } from 'lucide-react';
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

interface GamesTodayProps {
  className?: string;
}

export default function GamesToday({ className = '' }: GamesTodayProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodaysGames() {
      try {
        console.log('📅 Loading today\'s games...');
        const response = await fetch('/api/schedule/today');
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Loaded ${data.games.length} games for today`);
          setGames(data.games);
        } else {
          console.log('⚠️ No games found for today');
          setGames([]);
        }
      } catch (error) {
        console.error('❌ Error loading today\'s games:', error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTodaysGames();
  }, []);

  // Don't render if no games or still loading
  if (loading) return null;
  if (games.length === 0) return null;

  const formatGameTime = (gameTime: string) => {
    const date = new Date(gameTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
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
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Games Today</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {games.length} {games.length === 1 ? 'Game' : 'Games'}
            </span>
          </div>
          <Link 
            href="/schedule" 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <span>View Full Schedule</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/matchup/${game.id}`}
              className="block relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
            >
              {/* Gradient Banner */}
              <div 
                className="h-2 w-full"
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

                {/* Teams */}
                <div className="flex items-center justify-between">
                  {/* Away Team */}
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      <Image
                        src={`https://a.espncdn.com/i/teamlogos/nfl/500/${game.awayTeam.id.toLowerCase()}.png`}
                        alt={game.awayTeam.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 hidden`}>
                        {game.awayTeam.abbr}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{game.awayTeam.name}</h3>
                      <p className="text-sm text-gray-600">
                        {game.awayTeam.record} • {game.awayTeam.wins}W {game.awayTeam.losses}L
                        {game.awayTeam.ties > 0 && ` ${game.awayTeam.ties}T`}
                      </p>
                    </div>
                  </div>

                  {/* VS or Score */}
                  <div className="flex flex-col items-center mx-6">
                    {game.status === 'final' ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {game.awayScore} - {game.homeScore}
                        </div>
                        <div className="text-xs text-gray-500">FINAL</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-500">VS</div>
                      </div>
                    )}
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center space-x-3 flex-1 justify-end">
                    <div className="flex-1 text-right">
                      <h3 className="font-semibold text-gray-900">{game.homeTeam.name}</h3>
                      <p className="text-sm text-gray-600">
                        {game.homeTeam.record} • {game.homeTeam.wins}W {game.homeTeam.losses}L
                        {game.homeTeam.ties > 0 && ` ${game.homeTeam.ties}T`}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Image
                        src={`https://a.espncdn.com/i/teamlogos/nfl/500/${game.homeTeam.id.toLowerCase()}.png`}
                        alt={game.homeTeam.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className={`w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 hidden`}>
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
    </div>
  );
}
