'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
// Removed SportsDataIO import
import { Calendar, Tv } from 'lucide-react';
import { format, parseISO, startOfWeek, addWeeks, subWeeks } from 'date-fns';

// Game interface for schedule
interface Game {
  id: string;
  date: string;
  competitions: Array<{
    id: string;
    competitors: Array<{
      id: string;
      homeAway: 'home' | 'away';
      team: {
        id: string;
        displayName: string;
        logos?: Array<{ href: string }>;
      };
      score?: string;
    }>;
    status: {
      type: {
        state: string;
        completed: boolean;
      };
    };
    broadcasts?: Array<{
      names: string[];
    }>;
  }>;
}

export default function SchedulePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      
      // Mock schedule data
      const mockGames: Game[] = [
        {
          id: '1',
          date: '2025-01-19T20:00:00Z',
          competitions: [{
            id: '1',
            competitors: [
              {
                id: 'KC',
                homeAway: 'away' as const,
                team: {
                  id: 'KC',
                  displayName: 'Kansas City Chiefs',
                  logos: [{ href: `https://a.espncdn.com/i/teamlogos/nfl/500/kc.png` }]
                },
                score: '24'
              },
              {
                id: 'BUF',
                homeAway: 'home' as const,
                team: {
                  id: 'BUF',
                  displayName: 'Buffalo Bills',
                  logos: [{ href: `https://a.espncdn.com/i/teamlogos/nfl/500/buf.png` }]
                },
                score: '17'
              }
            ],
            status: {
              type: {
                state: 'post',
                completed: true
              }
            },
            broadcasts: [{ names: ['CBS'] }]
          }]
        }
      ];
      
      setGames(mockGames);
      setLoading(false);
    }
    loadSchedule();
  }, []);

  // Group games by date
  const gamesByDate = games.reduce((acc, game) => {
    try {
      if (!game.date) return acc;
      const date = format(parseISO(game.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(game);
    } catch (error) {
      console.warn('Invalid date for game:', game);
    }
    return acc;
  }, {} as Record<string, Game[]>);

  const sortedDates = Object.keys(gamesByDate).sort();

  return (
    <>
      <Head>
        <title>BuildParlays: NFL Schedule & AI Parlay Tools for 2025</title>
        <meta name="description" content="Build winning NFL parlays with BuildParlays' AI-powered calculator. Get expert NFL predictions and use our free parlay builder to build smarter bets today." />
        <link rel="canonical" href="https://www.buildparlays.com/schedule" />
        <meta property="og:title" content="BuildParlays: NFL Schedule & AI Parlay Tools for 2025" />
        <meta property="og:description" content="Boost NFL parlays with our free AI-powered calculator & tools." />
        <meta property="og:url" content="https://www.buildparlays.com/schedule" />
        <meta name="twitter:title" content="BuildParlays: NFL Schedule & AI Parlay Tools for 2025" />
        <meta name="twitter:description" content="Boost NFL parlays with our free AI-powered calculator & tools." />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BuildParlays NFL Schedule: Upcoming and Past Games</h1>
          <p className="text-gray-600">View upcoming and past NFL games</p>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Previous Week
            </button>
            <div className="text-center">
              <div className="text-sm text-gray-500">Current Week</div>
              <div className="text-lg font-semibold text-gray-900">
                {format(selectedWeek, 'MMMM d, yyyy')}
              </div>
            </div>
            <button
              onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next Week
            </button>
          </div>
        </div>

        {/* SEO Content Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming NFL Games</h2>
            <p className="text-gray-700 mb-4">
              Stay informed about the upcoming NFL games scheduled for this season. Our platform provides a detailed schedule that allows you to view game dates, times, and matchups, ensuring you never miss a moment of the action.
            </p>
            <p className="text-gray-700">
              For the current week, you can easily access information about the teams playing, their records, and previous matchups. This helps you make informed decisions when placing your bets, as understanding team performance is crucial for successful betting strategies.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Past NFL Games</h2>
            <p className="text-gray-700 mb-4">
              Explore the results of past NFL games to analyze team performance and trends. Reviewing past matchups can provide valuable insights that inform your betting strategies for future games.
            </p>
            <p className="text-gray-700">
              Our platform archives game results, including scores, player statistics, and highlights. This wealth of information allows you to evaluate how teams have performed historically, giving you an edge in your betting decisions.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">NFL Team Information</h2>
            <p className="text-gray-700 mb-4">
              Get comprehensive information about each NFL team, including rosters, player statistics, and team history. Knowing the strengths and weaknesses of each team is essential for making informed betting choices.
            </p>
            <p className="text-gray-700">
              Additionally, our team pages feature updates on injuries, trades, and other critical news that can impact game outcomes. Staying updated on team dynamics is vital for predicting how games will unfold and enhancing your betting strategy.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Betting Tools and Resources</h2>
            <p className="text-gray-700 mb-4">
              Utilize our AI-powered calculator and expert predictions to enhance your betting experience. These tools are designed to help you build effective NFL parlays tailored to your preferences and risk tolerance.
            </p>
            <p className="text-gray-700">
              Our resources include betting guides, tips from seasoned experts, and analysis of betting trends. Whether you&apos;re a novice or a seasoned bettor, these tools can significantly improve your chances of making successful wagers.
            </p>
          </div>
        </div>

        {/* Games List */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No games scheduled for this period</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Date Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <h2 className="text-xl font-bold">
                      {date ? format(parseISO(date), 'EEEE, MMMM d, yyyy') : 'TBD'}
                    </h2>
                  </div>
                </div>

                {/* Games for this date */}
                <div className="divide-y divide-gray-200">
                  {gamesByDate[date].map((game) => {
                    const competition = game.competitions[0];
                    const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
                    const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
                    const isLive = competition.status.type.state === 'in';
                    const isCompleted = competition.status.type.completed;

                    return (
                      <div key={game.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                          {/* Game Info */}
                          <div className="flex-1">
                            {/* Time and Status */}
                            <div className="flex items-center space-x-3 mb-4">
                              <span className="text-sm font-medium text-gray-600">
                                {game.date ? format(parseISO(game.date), 'h:mm a') : 'TBD'}
                              </span>
                              {isLive && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                  LIVE
                                </span>
                              )}
                              {isCompleted && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                                  FINAL
                                </span>
                              )}
                            </div>

                            {/* Teams */}
                            <div className="space-y-3">
                              {/* Away Team */}
                              {awayTeam && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    {awayTeam.team.logos?.[0]?.href && (
                                      <div className="relative w-10 h-10 flex-shrink-0">
                                        <Image
                                          src={awayTeam.team.logos[0].href}
                                          alt={awayTeam.team.displayName}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <Link
                                      href={`/teams/${awayTeam.team.id}`}
                                      className="font-semibold text-gray-900 hover:text-blue-600"
                                    >
                                      {awayTeam.team.displayName}
                                    </Link>
                                  </div>
                                  {awayTeam.score && (
                                    <span className="text-2xl font-bold text-gray-900 ml-4">
                                      {awayTeam.score}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Home Team */}
                              {homeTeam && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    {homeTeam.team.logos?.[0]?.href && (
                                      <div className="relative w-10 h-10 flex-shrink-0">
                                        <Image
                                          src={homeTeam.team.logos[0].href}
                                          alt={homeTeam.team.displayName}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    )}
                                    <Link
                                      href={`/teams/${homeTeam.team.id}`}
                                      className="font-semibold text-gray-900 hover:text-blue-600"
                                    >
                                      {homeTeam.team.displayName}
                                    </Link>
                                  </div>
                                  {homeTeam.score && (
                                    <span className="text-2xl font-bold text-gray-900 ml-4">
                                      {homeTeam.score}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Broadcast Info */}
                          <div className="md:ml-8 space-y-2 text-sm text-gray-600">
                            {competition.broadcasts?.[0] && (
                              <div className="flex items-center">
                                <Tv className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>{competition.broadcasts[0].names.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}


