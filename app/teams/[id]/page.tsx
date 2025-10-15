'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTeamWithRoster, groupRosterByPosition, getPositionName, getDepthLabel, getDepthBadgeColor } from '@/lib/teamService';
import type { SDTeam, SDPlayer } from '@/lib/sportsdataio';
import { ArrowLeft, Users, AlertCircle, Shield, Zap } from 'lucide-react';

export default function TeamDetailPage() {
  const params = useParams();
  const teamAbbr = params?.id as string;
  const [team, setTeam] = useState<SDTeam | null>(null);
  const [roster, setRoster] = useState<SDPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roster' | 'stats'>('roster');

  useEffect(() => {
    async function loadTeamData() {
      setLoading(true);
      console.log(`📡 Loading team data for ${teamAbbr}...`);
      const data = await getTeamWithRoster(teamAbbr.toUpperCase());
      
      if (data) {
        setTeam(data.team);
        setRoster(data.roster);
        console.log(`✅ Loaded ${data.team.FullName} with ${data.roster.length} players`);
      }
      setLoading(false);
    }
    loadTeamData();
  }, [teamAbbr]);

  // Group roster by position
  const groupedRoster = groupRosterByPosition(roster);

  // Organize positions by unit
  const offensePositions = ['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'T', 'OG', 'OT'];
  const defensePositions = ['DE', 'DT', 'NT', 'LB', 'ILB', 'OLB', 'MLB', 'CB', 'S', 'SS', 'FS', 'DB'];
  const specialTeamsPositions = ['K', 'P', 'LS'];

  // Filter positions that exist in roster
  const availableOffense = offensePositions.filter(pos => groupedRoster[pos]?.length > 0);
  const availableDefense = defensePositions.filter(pos => groupedRoster[pos]?.length > 0);
  const availableSpecialTeams = specialTeamsPositions.filter(pos => groupedRoster[pos]?.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white p-8 rounded-lg shadow mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 bg-gray-200 rounded"></div>
                <div className="space-y-3 flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-lg">Team not found</p>
          <Link href="/teams" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/teams"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Link>

        {/* Team Header */}
        <div
          className="bg-white p-8 rounded-lg shadow-lg mb-8"
          style={{
            background: `linear-gradient(135deg, #${team.PrimaryColor || '1e3a8a'} 0%, #${team.SecondaryColor || '3b82f6'} 100%)`,
          }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {team.WikipediaLogoUrl && (
              <div className="relative w-32 h-32 bg-white rounded-lg p-4 shadow-lg">
                <Image
                  src={team.WikipediaLogoUrl}
                  alt={team.FullName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center md:text-left text-white">
              <h1 className="text-4xl font-bold mb-2">{team.FullName}</h1>
              <p className="text-xl opacity-90 mb-2">{team.City} {team.Name}</p>
              <p className="text-lg opacity-80">{team.Key} • {team.Conference} {team.Division}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('roster')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roster'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Roster ({roster.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'roster' && (
          <div className="space-y-8">
            {/* Offense Section */}
            {availableOffense.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Zap className="h-6 w-6 mr-2" />
                    Offense
                  </h2>
                </div>
                <div className="p-6 space-y-8">
                  {availableOffense.map((position) => {
                    const players = groupedRoster[position];
                    return (
                      <div key={position}>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
                          {getPositionName(position)} ({players.length})
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                          {players.map((player, index) => (
                            <Link
                              key={player.PlayerID}
                              href={`/players/${player.PlayerID}?team=${teamAbbr}&name=${encodeURIComponent(player.FirstName + ' ' + player.LastName)}`}
                              className="flex-shrink-0 w-64 flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 snap-start"
                            >
                              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden">
                                <Image
                                  src={`https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`}
                                  alt={`${player.FirstName} ${player.LastName}`}
                                  fill
                                  className="object-cover rounded-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {player.FirstName} {player.LastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  #{player.Number || '?'}
                                </p>
                                <div className="flex flex-col gap-1 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getDepthBadgeColor(index)} w-fit`}>
                                    {getDepthLabel(player.Position, index)}
                                  </span>
                                  {player.InjuryStatus && player.InjuryStatus.toLowerCase() !== 'healthy' && player.InjuryStatus.toLowerCase() !== 'active' && player.InjuryStatus.toLowerCase() !== 'scrambled' && (
                                    <span className={`text-xs px-2 py-1 rounded-md font-bold flex items-center w-fit ${
                                      player.InjuryStatus.toLowerCase().includes('out') || player.InjuryStatus.toLowerCase().includes('ir') 
                                        ? 'bg-red-600 text-white' 
                                        : player.InjuryStatus.toLowerCase() === 'doubtful'
                                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    }`}>
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {player.InjuryStatus}
                                      {player.InjuryBodyPart && ` (${player.InjuryBodyPart})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Defense Section */}
            {availableDefense.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Shield className="h-6 w-6 mr-2" />
                    Defense
                  </h2>
                </div>
                <div className="p-6 space-y-8">
                  {availableDefense.map((position) => {
                    const players = groupedRoster[position];
                    return (
                      <div key={position}>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
                          {getPositionName(position)} ({players.length})
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                          {players.map((player, index) => (
                            <Link
                              key={player.PlayerID}
                              href={`/players/${player.PlayerID}?team=${teamAbbr}&name=${encodeURIComponent(player.FirstName + ' ' + player.LastName)}`}
                              className="flex-shrink-0 w-64 flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 snap-start"
                            >
                              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden">
                                <Image
                                  src={`https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`}
                                  alt={`${player.FirstName} ${player.LastName}`}
                                  fill
                                  className="object-cover rounded-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {player.FirstName} {player.LastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  #{player.Number || '?'}
                                </p>
                                <div className="flex flex-col gap-1 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getDepthBadgeColor(index)} w-fit`}>
                                    {getDepthLabel(player.Position, index)}
                                  </span>
                                  {player.InjuryStatus && player.InjuryStatus.toLowerCase() !== 'healthy' && player.InjuryStatus.toLowerCase() !== 'active' && player.InjuryStatus.toLowerCase() !== 'scrambled' && (
                                    <span className={`text-xs px-2 py-1 rounded-md font-bold flex items-center w-fit ${
                                      player.InjuryStatus.toLowerCase().includes('out') || player.InjuryStatus.toLowerCase().includes('ir') 
                                        ? 'bg-red-600 text-white' 
                                        : player.InjuryStatus.toLowerCase() === 'doubtful'
                                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    }`}>
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {player.InjuryStatus}
                                      {player.InjuryBodyPart && ` (${player.InjuryBodyPart})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Teams Section */}
            {availableSpecialTeams.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Special Teams
                  </h2>
                </div>
                <div className="p-6 space-y-8">
                  {availableSpecialTeams.map((position) => {
                    const players = groupedRoster[position];
                    return (
                      <div key={position}>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">
                          {getPositionName(position)} ({players.length})
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                          {players.map((player, index) => (
                            <Link
                              key={player.PlayerID}
                              href={`/players/${player.PlayerID}?team=${teamAbbr}&name=${encodeURIComponent(player.FirstName + ' ' + player.LastName)}`}
                              className="flex-shrink-0 w-64 flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 snap-start"
                            >
                              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-full overflow-hidden">
                                <Image
                                  src={`https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nfl/low-res/${player.PlayerID}.png`}
                                  alt={`${player.FirstName} ${player.LastName}`}
                                  fill
                                  className="object-cover rounded-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {player.FirstName} {player.LastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  #{player.Number || '?'}
                                </p>
                                <div className="flex flex-col gap-1 mt-1">
                                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getDepthBadgeColor(index)} w-fit`}>
                                    {getDepthLabel(player.Position, index)}
                                  </span>
                                  {player.InjuryStatus && player.InjuryStatus.toLowerCase() !== 'healthy' && player.InjuryStatus.toLowerCase() !== 'active' && player.InjuryStatus.toLowerCase() !== 'scrambled' && (
                                    <span className={`text-xs px-2 py-1 rounded-md font-bold flex items-center w-fit ${
                                      player.InjuryStatus.toLowerCase().includes('out') || player.InjuryStatus.toLowerCase().includes('ir') 
                                        ? 'bg-red-600 text-white' 
                                        : player.InjuryStatus.toLowerCase() === 'doubtful'
                                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                    }`}>
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {player.InjuryStatus}
                                      {player.InjuryBodyPart && ` (${player.InjuryBodyPart})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-gray-500 text-center">
              Team statistics will be available in a future update.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

