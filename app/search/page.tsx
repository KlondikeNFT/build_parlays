'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { nflApi, type Team } from '@/lib/api';
import { Search as SearchIcon } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<{ teams: Team[], players: any[] }>({ teams: [], players: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setResults({ teams: [], players: [] });
        return;
      }

      setLoading(true);
      const searchResults = await nflApi.search(query);
      setResults(searchResults);
      setLoading(false);
    }

    performSearch();
  }, [query]);

  const totalResults = results.teams.length + results.players.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Search Results</h1>
          {query && (
            <p className="text-gray-600">
              {loading ? 'Searching...' : `${totalResults} result${totalResults !== 1 ? 's' : ''} for &quot;${query}&quot;`}
            </p>
          )}
        </div>

        {!query ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Enter a search query to find teams and players</p>
          </div>
        ) : loading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No results found for &quot;{query}&quot;</p>
            <p className="text-gray-400">Try searching for a different team or player name</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Teams Results */}
            {results.teams.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">Teams ({results.teams.length})</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.teams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                        style={{ borderLeft: `4px solid #${team.color}` }}
                      >
                        {team.logos?.[0]?.href && (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={team.logos[0].href}
                              alt={team.displayName}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{team.displayName}</p>
                          <p className="text-sm text-gray-500">{team.abbreviation}</p>
                          <p className="text-xs text-gray-400">{team.location}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Players Results */}
            {results.players.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">Players ({results.players.length})</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.players.map((player) => (
                      <Link
                        key={player.id}
                        href={`/players/${player.id}`}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                      >
                        {player.headshot?.href && (
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <Image
                              src={player.headshot.href}
                              alt={player.displayName}
                              fill
                              className="object-cover rounded-full"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{player.displayName}</p>
                          <p className="text-sm text-gray-500">
                            #{player.jersey} • {player.position?.abbreviation}
                          </p>
                          {player.team && (
                            <p className="text-xs text-gray-400">{player.team.abbreviation}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Note about player search */}
            {results.teams.length > 0 && results.players.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Player search functionality requires roster data. Search results currently show teams only. 
                  To find a player, visit their team&apos;s page from the results above.
                </p>
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

