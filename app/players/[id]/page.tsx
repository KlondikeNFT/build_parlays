'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPlayerWithStats, getFullTeamName } from '@/lib/playerService';
import { ArrowLeft, TrendingUp, Target, Activity, Zap } from 'lucide-react';
import ProbabilitySlider from '@/components/ProbabilitySlider';
import VolatilityChart from '@/components/VolatilityChart';
import { getStatCategories } from '@/lib/probabilityCalculator';

function PlayerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerId = params.id as string;
  const team = searchParams.get('team') || '';
  const playerName = searchParams.get('name') || '';
  
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true);
      console.log(`📡 Loading player data for ${playerName} (${team})...`);
      const data = await getPlayerWithStats(playerName, team);
      if (data) {
        console.log(`✅ Loaded stats for ${data.player.FirstName} ${data.player.LastName}`);
        setPlayerData(data);
      }
      setLoading(false);
    }
    
    if (team && playerName) {
      loadPlayerData();
    }
  }, [playerId, team, playerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              {/* Spinning loader */}
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              {/* Pulsing background */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Player Stats</h3>
              <p className="text-sm text-gray-600">Fetching game-by-game analysis...</p>
            </div>
            
            {/* Skeleton preview */}
            <div className="mt-12 w-full max-w-2xl animate-pulse">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-lg">Player not found</p>
          <Link href="/teams" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const player = playerData.player;
  const stats = playerData.seasonStats;
  const gameLog = playerData.gameLog || [];
  const fullTeamName = getFullTeamName(player.Team);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href={`/teams/${player.Team}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {fullTeamName}
        </Link>

        {/* Player Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div 
            className="h-32"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
            }}
          ></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start -mt-16 md:-mt-16 space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gray-100 overflow-hidden">
                <Image
                  src={`https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`}
                  alt={`${player.FirstName} ${player.LastName}`}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="text-center md:text-left mt-4 md:mt-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {player.FirstName} {player.LastName}
                </h1>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-gray-600">
                  <span className="text-lg font-semibold">
                    #{player.Number || '?'} • {player.Position}
                  </span>
                  <span className="hidden md:inline text-gray-400">•</span>
                  <Link 
                    href={`/teams/${player.Team}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {fullTeamName}
                  </Link>
                </div>
                {player.InjuryStatus && player.InjuryStatus.toLowerCase() !== 'healthy' && player.InjuryStatus.toLowerCase() !== 'active' && player.InjuryStatus.toLowerCase() !== 'scrambled' && (
                  <div className={`mt-3 inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ${
                    player.InjuryStatus.toLowerCase().includes('out') || player.InjuryStatus.toLowerCase().includes('ir')
                      ? 'bg-red-600 text-white shadow-lg'
                      : player.InjuryStatus.toLowerCase() === 'doubtful'
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-yellow-500 text-white shadow-lg'
                  }`}>
                    <Activity className="h-5 w-5 mr-2" />
                    <div>
                      <div>{player.InjuryStatus}</div>
                      {player.InjuryBodyPart && (
                        <div className="text-xs opacity-90 mt-0.5">{player.InjuryBodyPart}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Probability Sliders */}
        {gameLog.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-bold text-gray-900">Next Game Projections</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {gameLog.length} game{gameLog.length !== 1 ? 's' : ''} analyzed
                  </span>
                  {gameLog.length < 4 && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                      Limited data
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Drag the sliders to see real-time probability calculations based on {playerData.player.FirstName}&apos;s season performance.
                {gameLog.length < 4 && ' (More games = more accurate predictions)'}
              </p>
              
              {/* All sliders in one unified container */}
              <div className="bg-gray-50 rounded-lg p-4">
                {getStatCategories(player.Position).map((statThreshold) => (
                  <ProbabilitySlider
                    key={statThreshold.stat}
                    statThreshold={statThreshold}
                    gameStats={gameLog}
                  />
                ))}
              </div>
            </div>
            
            {/* Volatility Chart - Separate Box */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
              <VolatilityChart 
                gameStats={gameLog}
                position={player.Position}
                playerName={`${player.FirstName} ${player.LastName}`}
              />
            </div>
          </>
        )}

        {/* 2025 Season Statistics */}
        {stats && Object.keys(stats).length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">2025 Season Statistics</h2>
            </div>
            
            {stats.Played > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.Played}</div>
                    <div className="text-sm text-gray-600">Games Played</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.Started || 0}</div>
                    <div className="text-sm text-gray-600">Games Started</div>
                  </div>
                  {stats.FantasyPointsPPR && (
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{Math.round(stats.FantasyPointsPPR)}</div>
                      <div className="text-sm text-gray-600">Fantasy Points</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Passing Stats */}
            {player.Position === 'QB' && stats.PassingYards > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Passing</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.PassingYards || 0)}</div>
                    <div className="text-xs text-gray-600">Yards</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.PassingTouchdowns || 0)}</div>
                    <div className="text-xs text-gray-600">TDs</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.PassingInterceptions || 0)}</div>
                    <div className="text-xs text-gray-600">INTs</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{stats.PassingRating ? stats.PassingRating.toFixed(1) : 'N/A'}</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
            )}

            {/* Rushing Stats */}
            {stats.RushingYards > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Rushing</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.RushingYards || 0)}</div>
                    <div className="text-xs text-gray-600">Yards</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.RushingTouchdowns || 0)}</div>
                    <div className="text-xs text-gray-600">TDs</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.RushingAttempts || 0)}</div>
                    <div className="text-xs text-gray-600">Attempts</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{stats.RushingYardsPerAttempt ? stats.RushingYardsPerAttempt.toFixed(1) : 'N/A'}</div>
                    <div className="text-xs text-gray-600">Avg</div>
                  </div>
                </div>
              </div>
            )}

            {/* Receiving Stats */}
            {stats.ReceivingYards > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Receiving</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.ReceivingYards || 0)}</div>
                    <div className="text-xs text-gray-600">Yards</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.Receptions || 0)}</div>
                    <div className="text-xs text-gray-600">Receptions</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.ReceivingTouchdowns || 0)}</div>
                    <div className="text-xs text-gray-600">TDs</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-xl font-bold text-gray-900">{Math.round(stats.ReceivingTargets || 0)}</div>
                    <div className="text-xs text-gray-600">Targets</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game-by-Game Stats */}
        {gameLog.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center mb-6">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">2025 Season Game Log</h2>
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading Animation */}
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              {/* Spinning loader */}
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              {/* Pulsing background */}
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Player Stats</h3>
              <p className="text-sm text-gray-600">Fetching game-by-game analysis...</p>
            </div>
            
            {/* Skeleton preview */}
            <div className="mt-12 w-full max-w-2xl animate-pulse">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}

