'use client';

import Link from 'next/link';
import { Calendar, Users, TrendingUp, Search, Sparkles, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { sportsdataApi, type SDTeam } from '@/lib/sportsdataio';
import { getAllTeams, type TeamWithRecord } from '@/lib/teamService';
import { getRealTopPlayersFromSportsData } from '@/lib/realPlayerService';
import type { TopPlayer } from '@/lib/statsAnalyzer';
import { getTeamColors, getLikelihoodGradient } from '@/lib/teamColors';
import Image from 'next/image';

// Game interface for schedule
interface Game {
  id: string;
  date: string;
  competitions: Array<{
    id: string;
    competitors: Array<{
      id: string;
      team: {
        id: string;
        displayName: string;
        logos?: Array<{ href: string }>;
      };
      score?: string;
    }>;
    broadcasts?: Array<{
      names: string[];
    }>;
  }>;
}

export default function Home() {
  const [featuredTeams, setFeaturedTeams] = useState<TeamWithRecord[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{city: string; state: string} | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Get user's location on mount
  useEffect(() => {
    async function getUserLocation() {
      try {
        // Try to get user's location via IP geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.city && data.region) {
          setUserLocation({ city: data.city, state: data.region });
          console.log(`📍 User location: ${data.city}, ${data.region}`);
        }
      } catch (error) {
        console.log('Could not determine user location');
      }
    }
    getUserLocation();
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [teams, schedule] = await Promise.all([
        getAllTeams(), // Use SportsDataIO teams
        sportsdataApi.getSchedule('2025'),
      ]);
      
      // Sort teams to show user's local team first
      const sortedTeams = sortTeamsByLocation(teams, userLocation);
      
      // Convert schedule to Game format (take upcoming games)
      const currentWeek = await sportsdataApi.getCurrentWeek();
      const upcomingSchedule = schedule
        .filter(game => game.Week === currentWeek && !game.IsClosed)
        .slice(0, 6)
        .map(game => ({
          id: game.GameKey || game.ScoreID?.toString() || '',
          date: game.DateTime || game.Date || '',
          competitions: [{
            id: game.ScoreID?.toString() || '',
            competitors: [
              {
                id: game.AwayTeam,
                team: {
                  id: game.AwayTeam,
                  displayName: game.AwayTeam,
                  logos: [{ href: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.AwayTeam.toLowerCase()}.png` }]
                },
                score: game.AwayScore?.toString()
              },
              {
                id: game.HomeTeam,
                team: {
                  id: game.HomeTeam,
                  displayName: game.HomeTeam,
                  logos: [{ href: `https://a.espncdn.com/i/teamlogos/nfl/500/${game.HomeTeam.toLowerCase()}.png` }]
                },
                score: game.HomeScore?.toString()
              }
            ],
            broadcasts: game.Channel ? [{ names: [game.Channel] }] : []
          }]
        }));
      
      setFeaturedTeams(sortedTeams.slice(0, 8));
      setUpcomingGames(upcomingSchedule);
      setLoading(false);
    }
    loadData();
  }, [userLocation]);

  useEffect(() => {
    async function loadTopPlayers() {
      setPlayersLoading(true);
      try {
        // Fetch REAL players from SportsDataIO (professional data!)
        console.log('🏈 Loading REAL NFL players from SportsDataIO...');
        const players = await getRealTopPlayersFromSportsData();
        
        if (players.length > 0) {
          console.log(`✅ Loaded ${players.length} REAL players with actual stats!`);
          setTopPlayers(players);
        } else {
          console.log('⚠️ No players returned, check API key');
          setTopPlayers([]);
        }
      } catch (error) {
        console.error('❌ Error loading players:', error);
        setTopPlayers([]);
      }
      setPlayersLoading(false);
    }
    loadTopPlayers();
  }, []);

  // Helper function to intelligently sort teams
  // Shows local teams + popular teams without revealing location tracking
  const sortTeamsByLocation = (teams: SDTeam[], location: {city: string; state: string} | null): SDTeam[] => {
    // Define popular/successful teams that should always be featured
    const popularTeams = ['KC', 'SF', 'BUF', 'DAL', 'PHI', 'BAL', 'MIA', 'DET'];
    
    // Map states to NFL teams (silent location-based sorting)
    const stateTeams: Record<string, string[]> = {
      'Arizona': ['ARI'],
      'Georgia': ['ATL'],
      'Maryland': ['BAL'],
      'New York': ['BUF', 'NYG', 'NYJ'],
      'North Carolina': ['CAR'],
      'Illinois': ['CHI'],
      'Ohio': ['CIN', 'CLE'],
      'Texas': ['DAL', 'HOU'],
      'Colorado': ['DEN'],
      'Michigan': ['DET'],
      'Wisconsin': ['GB'],
      'Indiana': ['IND'],
      'Florida': ['JAX', 'MIA', 'TB'],
      'Missouri': ['KC'],
      'California': ['LAC', 'LAR', 'SF'],
      'Nevada': ['LV'],
      'Massachusetts': ['NE'],
      'Louisiana': ['NO'],
      'Pennsylvania': ['PHI', 'PIT'],
      'Washington': ['SEA'],
      'Tennessee': ['TEN'],
      'District of Columbia': ['WAS'],
    };
    
    const localTeamKeys = location ? (stateTeams[location.state] || []) : [];
    
    // Smart sort: blend local + popular teams naturally
    return [...teams].sort((a, b) => {
      const aIsLocal = localTeamKeys.includes(a.Key);
      const bIsLocal = localTeamKeys.includes(b.Key);
      const aIsPopular = popularTeams.includes(a.Key);
      const bIsPopular = popularTeams.includes(b.Key);
      
      // Priority: Local teams first
      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;
      
      // Then popular teams
      if (aIsPopular && !bIsPopular) return -1;
      if (!aIsPopular && bIsPopular) return 1;
      
      // Then alphabetical
      return a.FullName.localeCompare(b.FullName);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-yellow-300 mr-2" />
              <span className="text-xs font-semibold uppercase tracking-wider text-yellow-300 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                AI-Powered Analytics
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              BuildParlays
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100">
              Free AI Parlay Calculator for Smart NFL Betting
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/teams"
                className="bg-white text-blue-900 px-6 py-2.5 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg text-sm"
              >
                Explore Teams
              </Link>
              <Link
                href="/schedule"
                className="bg-blue-700 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-lg text-sm"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="bg-yellow-50 border-y border-yellow-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm md:text-sm lg:text-base text-gray-700">
            <span className="font-semibold">Disclaimer:</span> BuildParlays has no affiliation with any casino or sportsbook organizations. All predictions are for informational and entertainment purposes only.
          </p>
        </div>
      </section>

      {/* This Week's Top Players Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Sparkles className="h-7 w-7 text-yellow-500 mr-3" />
                This Week&apos;s Top Parlay Players
              </h2>
              <p className="text-gray-600">AI-calculated parlay predictions based on consistent performance and low volatility</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button 
                onClick={scrollLeft}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button 
                onClick={scrollRight}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {playersLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg animate-pulse">
                <div className="bg-gray-200 h-32 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topPlayers.length === 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
            <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-2 font-semibold">Featured Parlay Players Coming Soon</p>
            <p className="text-gray-600 text-sm">
              Check out Teams and Schedule pages to explore NFL parlay data!
            </p>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topPlayers.map((player) => {
              const injuryStatus = player.injuryStatus || 'Active';
              const injuryStatusLower = injuryStatus.toLowerCase();
              const isHealthy =
                injuryStatusLower === 'active' || injuryStatusLower === 'probable';
              const injuryBadgeClass = isHealthy
                ? 'bg-green-500/20 text-green-100 border border-green-300/40'
                : 'bg-red-500/20 text-red-100 border border-red-300/40';
              const volatilityLevel =
                player.volatility <= 25
                  ? 'Low'
                  : player.volatility <= 45
                  ? 'Moderate'
                  : 'High';
              const trendColor =
                player.trend === 'increasing'
                  ? 'text-green-600'
                  : player.trend === 'decreasing'
                  ? 'text-red-600'
                  : 'text-gray-600';
              const consistencyLabel =
                player.overallConsistency >= 75
                  ? 'High Stability'
                  : player.overallConsistency >= 60
                  ? 'Moderate Stability'
                  : 'Needs Monitoring';
              const consistencyColor =
                player.overallConsistency >= 75
                  ? 'text-green-600'
                  : player.overallConsistency >= 60
                  ? 'text-yellow-600'
                  : 'text-orange-600';
              
              // Get team-specific colors
              const teamColors = getTeamColors(player.teamAbbr);

              return (
                <div
                  key={player.id}
                  className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 snap-start"
                >
                  {/* Player Header with Team Colors */}
                  <div 
                    className="text-white p-4 sm:p-5 rounded-t-xl"
                    style={{
                      background: `linear-gradient(to right, ${teamColors.primary}, ${teamColors.secondary})`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-16 h-16 sm:w-18 sm:h-18 bg-white rounded-full p-1 shadow-lg">
                        <Image
                          src={player.image}
                          alt={player.name}
                          fill
                          className="object-contain rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{player.name}</h3>
                        <p className="text-white/90 text-xs sm:text-sm truncate">{player.team}</p>
                        <p className="text-white/80 text-xs font-semibold">
                          {player.position} • {player.teamAbbr}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wide text-white/80">
                            {player.gamesPlayed} games
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${injuryBadgeClass}`}
                          >
                            {!isHealthy && <AlertCircle className="h-2.5 w-2.5" />}
                            {injuryStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Predictions */}
                  <div className="p-3 sm:p-4 space-y-2.5">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900">
                        <span className="truncate">{player.primaryMetricLabel}</span>
                        <span>{player.averagePerGame}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                        <div>
                          <p className="font-semibold text-gray-900 text-[10px] sm:text-xs">Volatility</p>
                          <p className="text-[10px] sm:text-xs">
                            {volatilityLevel} ({player.volatility}%)
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[10px] sm:text-xs">Trend</p>
                          <p className={`capitalize text-[10px] sm:text-xs ${trendColor}`}>{player.trend}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        AI Predictions
                      </span>
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    </div>

                    {player.stats.map((stat, idx) => {
                      const isHighConfidence = stat.likelihood >= 70;
                      const isMediumConfidence =
                        stat.likelihood >= 60 && stat.likelihood < 70;
                      
                      // Get gradient based on likelihood
                      const likelihoodGradient = getLikelihoodGradient(stat.likelihood);

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-2">
                              {stat.label}
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                isHighConfidence
                                  ? 'text-green-600'
                                  : isMediumConfidence
                                  ? 'text-yellow-600'
                                  : 'text-orange-600'
                              }`}
                            >
                              {stat.likelihood}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${stat.likelihood}%`,
                                background: likelihoodGradient
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 border-t border-gray-200 mt-3">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500">
                        <span>Consistency</span>
                        <span className={`font-semibold ${consistencyColor}`}>
                          {player.overallConsistency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile scroll hint */}
        {!playersLoading && topPlayers.length > 0 && (
          <div className="md:hidden text-center mt-4 text-sm text-gray-500">
            ← Scroll to see more players →
          </div>
        )}

        {/* Real-time data badge */}
        {!playersLoading && topPlayers.length > 0 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">
                Real players from current NFL rosters
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Featured Teams Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Teams</h2>
          <Link href="/teams" className="text-blue-600 hover:text-blue-700 font-semibold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {featuredTeams.map((team) => (
              <Link 
                key={team.TeamID} 
                href={`/teams/${team.Key}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-1"
                style={{ borderTop: `4px solid #${team.PrimaryColor || '1e3a8a'}` }}
              >
                <div className="text-center">
                  {team.WikipediaLogoUrl && (
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src={team.WikipediaLogoUrl}
                        alt={team.FullName}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm">{team.FullName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{team.Key}</p>
                  {team.record && (
                    <p className="text-sm font-semibold text-blue-600 mt-2">{team.record}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{team.City}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Games Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">This Week&apos;s Games</h2>
          <Link href="/schedule" className="text-blue-600 hover:text-blue-700 font-semibold">
            Full Schedule →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingGames.map((game) => (
              <div key={game.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-sm text-gray-500 mb-3">
                  {new Date(game.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
                <div className="space-y-2">
                  {game.competitions[0]?.competitors.map((competitor) => (
                    <div key={competitor.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {competitor.team.logos?.[0]?.href && (
                          <div className="relative w-8 h-8">
                            <Image
                              src={competitor.team.logos[0].href}
                              alt={competitor.team.displayName}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <Link 
                          href={`/teams/${competitor.team.id}`}
                          className="font-semibold hover:text-blue-600"
                        >
                          {competitor.team.displayName}
                        </Link>
                      </div>
                      {competitor.score && (
                        <span className="text-xl font-bold">{competitor.score}</span>
                      )}
                    </div>
                  ))}
                </div>
                {game.competitions[0]?.broadcasts?.[0] && (
                  <div className="mt-3 text-sm text-gray-500">
                    📺 {game.competitions[0].broadcasts[0].names.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Better Parlays?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start exploring comprehensive NFL parlay data and make informed betting decisions today.
          </p>
          <Link
            href="/teams"
            className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-lg inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
