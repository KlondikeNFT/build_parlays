'use client';

import Link from 'next/link';
import { Calendar, Users, TrendingUp, Search, Sparkles, ChevronRight, ChevronLeft, AlertCircle, Trophy } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getAllTeams, type TeamWithRecord } from '@/lib/teamService';
import { mockDataService } from '@/lib/mockData';
import type { TopPlayer } from '@/lib/statsAnalyzer';
import { getTeamColors, getLikelihoodGradient } from '@/lib/teamColors';
import Image from 'next/image';
import GamesToday from '@/components/GamesToday';
import UpcomingGames from '@/components/UpcomingGames';

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
      const teams = await getAllTeams();
      
      // Sort teams to show user's local team first
      const sortedTeams = sortTeamsByLocation(teams, userLocation);
      
      // Schedule data is now handled by the UpcomingGames component
      
      setFeaturedTeams(sortedTeams.slice(0, 8));
      setLoading(false);
    }
    loadData();
  }, [userLocation]);

  useEffect(() => {
    async function loadTopPlayers() {
      setPlayersLoading(true);
      try {
        // Fetch real weekly top performers
        console.log('🏈 Loading weekly top performers...');
        const response = await fetch('/api/players/weekly-top?week=6'); // Previous week
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Loaded ${data.topPlayers.length} top performers from Week ${data.week}!`);
          setTopPlayers(data.topPlayers);
        } else {
          console.log('⚠️ Could not load weekly top players, using fallback');
          // Fallback to mock data if API fails
          const players = await mockDataService.getTopPlayers();
          setTopPlayers(players);
        }
      } catch (error) {
        console.error('❌ Error loading weekly top players:', error);
        // Fallback to mock data
        try {
          const players = await mockDataService.getTopPlayers();
          setTopPlayers(players);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          setTopPlayers([]);
        }
      }
      setPlayersLoading(false);
    }
    loadTopPlayers();
  }, []);

  // Helper function to intelligently sort teams
  // Shows local teams + popular teams without revealing location tracking
  const sortTeamsByLocation = (teams: TeamWithRecord[], location: {city: string; state: string} | null): TeamWithRecord[] => {
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
              BuildParlays: AI-Powered NFL Parlay Calculator &amp; Expert Predictions
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
              const volatility = player.volatility || 30; // Default for new API
              const volatilityLevel =
                volatility <= 25
                  ? 'Low'
                  : volatility <= 45
                  ? 'Moderate'
                  : 'High';
              const trend = player.trend || 'stable'; // Default for new API
              const trendColor =
                trend === 'increasing'
                  ? 'text-green-600'
                  : trend === 'decreasing'
                  ? 'text-red-600'
                  : 'text-gray-600';
              const consistencyLabel =
                player.overallConsistency >= 75
                  ? 'High Stability'
                  : player.overallConsistency >= 60
                  ? 'Moderate Stability'
                  : 'Needs Monitoring';
              const consistencyScore = (player as any).consistencyScore || (player as any).overallConsistency;
              const consistencyColor =
                consistencyScore >= 75
                  ? 'text-green-600'
                  : consistencyScore >= 60
                  ? 'text-yellow-600'
                  : 'text-orange-600';
              
              // Get team-specific colors
              const teamColors = getTeamColors(player.team || player.teamAbbr);

              return (
                <Link
                  key={(player as any).player_id || (player as any).id}
                  href={`/players/${(player as any).player_id || (player as any).id}?team=${(player as any).team}&name=${encodeURIComponent((player as any).player_name || (player as any).name)}`}
                  className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 snap-start cursor-pointer"
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
                          src={(player as any).image || `https://a.espncdn.com/i/headshots/nfl/players/full/${(player as any).player_id || (player as any).id}.png`}
                          alt={(player as any).player_name || (player as any).name}
                          fill
                          className="object-contain rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{(player as any).player_name || (player as any).name}</h3>
                        <p className="text-white/90 text-xs sm:text-sm truncate">{(player as any).team}</p>
                        <p className="text-white/80 text-xs font-semibold">
                          {(player as any).position} • {(player as any).team}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          {(player as any).achievements && (player as any).achievements.length > 0 ? (
                            <span className="text-[10px] uppercase tracking-wide text-white/80">
                              {(player as any).achievements.length} Week {(player as any).week || 6} Achievement{(player as any).achievements.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wide text-white/80">
                              {(player as any).gamesPlayed || 0} games
                            </span>
                          )}
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
                        <span className="truncate">{player.primaryMetricLabel || 'Weekly Performance'}</span>
                        <span>{player.averagePerGame || 'Top Performer'}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                        <div>
                          <p className="font-semibold text-gray-900 text-[10px] sm:text-xs">Volatility</p>
                          <p className="text-[10px] sm:text-xs">
                            {volatilityLevel} ({volatility}%)
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[10px] sm:text-xs">Trend</p>
                          <p className={`capitalize text-[10px] sm:text-xs ${trendColor}`}>{trend}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        AI Predictions
                      </span>
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                    </div>

                    {((player as any).parlayPredictions || (player as any).stats || []).map((stat: any, idx: number) => {
                      const isHighConfidence = (stat.confidence || stat.likelihood) >= 70;
                      const isMediumConfidence =
                        (stat.confidence || stat.likelihood) >= 60 && (stat.confidence || stat.likelihood) < 70;
                      
                      // Get gradient based on likelihood/confidence
                      const likelihoodGradient = getLikelihoodGradient(stat.confidence || stat.likelihood);

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate pr-2">
                              {stat.description || stat.label}
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
                              {stat.confidence || stat.likelihood}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${stat.confidence || stat.likelihood}%`,
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
                          {(player as any).consistencyScore || (player as any).overallConsistency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Achievements */}
                  {(player as any).achievements && (player as any).achievements.length > 0 && (
                    <div className="p-3 sm:p-4 bg-blue-50 border-t border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                          Week {(player as any).week || 6} Achievements
                        </span>
                        <Trophy className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        {(player as any).achievements.slice(0, 2).map((achievement: any, idx: number) => (
                          <div key={idx} className="text-xs text-blue-700">
                            <span className="font-medium">#{achievement.rank}</span> {achievement.description}
                          </div>
                        ))}
                        {(player as any).achievements.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{(player as any).achievements.length - 2} more achievement{(player as any).achievements.length - 2 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
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

      {/* Games Today Section */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <GamesToday />
      </section>

      {/* Upcoming Games Section */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <UpcomingGames />
      </section>

      {/* SEO Content Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding NFL Betting Basics</h2>
            <p className="text-gray-700 mb-4">
              NFL betting can seem complex, but understanding the basics is crucial for making informed decisions. Key concepts include point spreads, moneylines, and over/under totals, which form the foundation of most betting strategies.
            </p>
            <p className="text-gray-700">
              For instance, a point spread indicates the margin by which a team must win for a bet to pay out. Familiarizing yourself with these terms will help you navigate the betting landscape more effectively and increase your chances of success.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use the AI-Powered Parlay Calculator</h2>
            <p className="text-gray-700 mb-4">
              The AI-powered parlay calculator is designed to simplify the process of creating winning parlays. By inputting your selections and desired outcomes, the calculator analyzes historical data and current statistics to offer optimal betting suggestions.
            </p>
            <p className="text-gray-700">
              This tool not only saves time but also enhances your betting strategy by leveraging advanced analytics. Users can experiment with various combinations to see potential payouts, making it an invaluable resource for both novice and experienced bettors.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Expert Predictions for NFL Games</h2>
            <p className="text-gray-700 mb-4">
              Expert predictions are a vital resource for bettors looking to gain an edge in NFL wagering. These insights are typically based on in-depth analysis of team performance, player statistics, and other relevant factors that influence game outcomes.
            </p>
            <p className="text-gray-700">
              For example, expert analysts may provide forecasts for upcoming matchups, highlighting key players to watch and potential game-changing events. Utilizing these predictions can help bettors make more informed choices and enhance their overall betting strategy.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Exploring Team Statistics and Trends</h2>
            <p className="text-gray-700 mb-4">
              Understanding team statistics and trends is essential for successful NFL betting. Analyzing data such as win-loss records, scoring averages, and defensive rankings can provide valuable insights into team performance.
            </p>
            <p className="text-gray-700">
              For example, a team that consistently performs well against the spread may be a strong candidate for your betting slip. Keeping track of these metrics can help you identify patterns and inform your betting decisions, ultimately leading to more successful outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Teams Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Top NFL Teams to Target in This Week&apos;s Parlays</h2>
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
