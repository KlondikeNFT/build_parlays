'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, User, Users, TrendingUp } from 'lucide-react';
import { searchPlayersAndTeams, getFullTeamName } from '@/lib/playerService';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [searchResults, setSearchResults] = useState<{
    players: any[];
    teams: any[];
  }>({ players: [], teams: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (query.trim()) {
        setLoading(true);
        try {
          const results = await searchPlayersAndTeams(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults({ players: [], teams: [] });
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults({ players: [], teams: [] });
      }
    }

    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search</h1>
          {query && (
            <p className="text-gray-600">
              Searching for &quot;{query}&quot;
            </p>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Searching...</p>
            </div>
          </div>
        ) : !query.trim() ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Enter a search term to find players and teams</p>
            <p className="text-gray-400">Try searching for &quot;Mahomes&quot;, &quot;Chiefs&quot;, or &quot;Kelce&quot;</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Players Results */}
            {searchResults.players.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Players ({searchResults.players.length})
                    </h2>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {searchResults.players.map((player) => (
                    <Link
                      key={player.PlayerID}
                      href={`/players/${player.PlayerID}?team=${player.Team}&name=${encodeURIComponent(player.FirstName + ' ' + player.LastName)}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {player.Number || '?'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {player.FirstName} {player.LastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {player.Position} • {getFullTeamName(player.Team)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {player.Position}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Results */}
            {searchResults.teams.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Teams ({searchResults.teams.length})
                    </h2>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {searchResults.teams.map((team) => (
                    <Link
                      key={team.TeamID}
                      href={`/teams/${team.Key}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold text-lg">
                              {team.Key}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {team.FullName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {team.Conference} • {team.Division}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {team.Conference}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && searchResults.players.length === 0 && searchResults.teams.length === 0 && query.trim() && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No results found</p>
                <p className="text-gray-400">Try searching for &quot;Mahomes&quot;, &quot;Chiefs&quot;, or &quot;Kelce&quot;</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

