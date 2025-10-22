'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, Clock, Tv, Users, TrendingUp, ArrowLeft, Trophy, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MatchupData {
  game: {
    id: string;
    week: number;
    date: string;
    homeScore?: number;
    awayScore?: number;
    status: 'scheduled' | 'final';
  };
  homeTeam: {
    id: string;
    name: string;
    abbr: string;
    conference: string;
    division: string;
    primaryColor: string;
    secondaryColor: string;
    record: string;
    wins: number;
    losses: number;
    ties: number;
    winPercentage: number;
    recentGames: Array<{
      game_id: string;
      week: number;
      home_team: string;
      away_team: string;
      home_score: number;
      away_score: number;
      team_side: string;
      result: string;
    }>;
    topPlayers: Array<{
      player_id: number;
      player_name: string;
      position: string;
      team: string;
      passing_yards?: number;
      rushing_yards?: number;
      receiving_yards?: number;
      passing_touchdowns?: number;
      rushing_touchdowns?: number;
      receiving_touchdowns?: number;
      games_played: number;
    }>;
  };
  awayTeam: {
    id: string;
    name: string;
    abbr: string;
    conference: string;
    division: string;
    primaryColor: string;
    secondaryColor: string;
    record: string;
    wins: number;
    losses: number;
    ties: number;
    winPercentage: number;
    recentGames: Array<{
      game_id: string;
      week: number;
      home_team: string;
      away_team: string;
      home_score: number;
      away_score: number;
      team_side: string;
      result: string;
    }>;
    topPlayers: Array<{
      player_id: number;
      player_name: string;
      position: string;
      team: string;
      passing_yards?: number;
      rushing_yards?: number;
      receiving_yards?: number;
      passing_touchdowns?: number;
      rushing_touchdowns?: number;
      receiving_touchdowns?: number;
      games_played: number;
    }>;
  };
}

export default function MatchupPage() {
  const params = useParams();
  const gameId = params?.gameId as string;
  
  const [matchupData, setMatchupData] = useState<MatchupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatchupData() {
      try {
        console.log(`🏈 Loading matchup data for game: ${gameId}`);
        const response = await fetch(`/api/matchup/${gameId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Loaded matchup data for ${data.awayTeam.name} @ ${data.homeTeam.name}`);
          setMatchupData(data);
        } else {
          setError('Game not found');
        }
      } catch (error) {
        console.error('❌ Error loading matchup data:', error);
        setError('Failed to load game data');
      } finally {
        setLoading(false);
      }
    }

    if (gameId) {
      fetchMatchupData();
    }
  }, [gameId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matchup data...</p>
        </div>
      </div>
    );
  }

  if (error || !matchupData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested game could not be found.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const formatGameTime = (date: string) => {
    const gameDate = new Date(date);
    return gameDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradientStyle = (awayColor: string, homeColor: string) => {
    return {
      background: `linear-gradient(90deg, ${awayColor} 0%, #ffffff 50%, ${homeColor} 100%)`
    };
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'text-green-600 bg-green-100';
      case 'L': return 'text-red-600 bg-red-100';
      case 'T': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="text-sm text-gray-500">
              Week {matchupData.game.week} • {formatGameTime(matchupData.game.date)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          {/* Gradient Banner */}
          <div 
            className="h-3 w-full rounded-t-xl"
            style={getGradientStyle(matchupData.awayTeam.primaryColor, matchupData.homeTeam.primaryColor)}
          />
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {matchupData.awayTeam.name} @ {matchupData.homeTeam.name}
              </h1>
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatGameTime(matchupData.game.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>8:20 PM ET</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tv className="w-4 h-4" />
                  <span>ESPN</span>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between">
              {/* Away Team */}
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <Image
                    src={`https://a.espncdn.com/i/teamlogos/nfl/500/${matchupData.awayTeam.id.toLowerCase()}.png`}
                    alt={matchupData.awayTeam.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className={`w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hidden`}>
                    {matchupData.awayTeam.abbr}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{matchupData.awayTeam.name}</h2>
                  <p className="text-gray-600">
                    {matchupData.awayTeam.conference} {matchupData.awayTeam.division}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {matchupData.awayTeam.record} • {matchupData.awayTeam.wins}W {matchupData.awayTeam.losses}L
                    {matchupData.awayTeam.ties > 0 && ` ${matchupData.awayTeam.ties}T`}
                  </p>
                </div>
              </div>

              {/* VS or Score */}
              <div className="flex flex-col items-center mx-8">
                {matchupData.game.status === 'final' ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {matchupData.game.awayScore} - {matchupData.game.homeScore}
                    </div>
                    <div className="text-sm text-gray-500">FINAL</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">VS</div>
                  </div>
                )}
              </div>

              {/* Home Team */}
              <div className="flex items-center space-x-4 flex-1 justify-end">
                <div className="flex-1 text-right">
                  <h2 className="text-2xl font-bold text-gray-900">{matchupData.homeTeam.name}</h2>
                  <p className="text-gray-600">
                    {matchupData.homeTeam.conference} {matchupData.homeTeam.division}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {matchupData.homeTeam.record} • {matchupData.homeTeam.wins}W {matchupData.homeTeam.losses}L
                    {matchupData.homeTeam.ties > 0 && ` ${matchupData.homeTeam.ties}T`}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Image
                    src={`https://a.espncdn.com/i/teamlogos/nfl/500/${matchupData.homeTeam.id.toLowerCase()}.png`}
                    alt={matchupData.homeTeam.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className={`w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hidden`}>
                    {matchupData.homeTeam.abbr}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Stats and Recent Games */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Away Team Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {matchupData.awayTeam.name} Stats
            </h3>
            
            {/* Recent Games */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Recent Games</h4>
              <div className="space-y-2">
                {matchupData.awayTeam.recentGames.map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      Week {game.week}: {game.away_team} @ {game.home_team}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(game.result)}`}>
                      {game.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Players */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Players</h4>
              <div className="space-y-2">
                {matchupData.awayTeam.topPlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-900">{player.player_name}</span>
                    <span className="text-xs text-gray-600">{player.position}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Home Team Stats */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              {matchupData.homeTeam.name} Stats
            </h3>
            
            {/* Recent Games */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Recent Games</h4>
              <div className="space-y-2">
                {matchupData.homeTeam.recentGames.map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      Week {game.week}: {game.away_team} @ {game.home_team}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(game.result)}`}>
                      {game.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Players */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Players</h4>
              <div className="space-y-2">
                {matchupData.homeTeam.topPlayers.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-900">{player.player_name}</span>
                    <span className="text-xs text-gray-600">{player.position}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

