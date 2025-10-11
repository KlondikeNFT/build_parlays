'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllTeams, type TeamWithRecord } from '@/lib/teamService';
import { Search } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithRecord[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamWithRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConference, setSelectedConference] = useState<'all' | 'AFC' | 'NFC'>('all');

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      console.log('📡 Loading NFL teams from SportsDataIO...');
      const data = await getAllTeams();
      console.log(`✅ Loaded ${data.length} teams`);
      setTeams(data);
      setFilteredTeams(data);
      setLoading(false);
    }
    loadTeams();
  }, []);

  useEffect(() => {
    let filtered = teams;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(team =>
        team.FullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.City.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.Name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by conference
    if (selectedConference !== 'all') {
      filtered = filtered.filter(team => team.Conference === selectedConference);
    }

    setFilteredTeams(filtered);
  }, [searchQuery, selectedConference, teams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">NFL Teams</h1>
          <p className="text-gray-600">Browse all 32 NFL teams and their rosters</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Conference Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedConference('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedConference === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedConference('AFC')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedConference === 'AFC'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                AFC
              </button>
              <button
                onClick={() => setSelectedConference('NFC')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedConference === 'NFC'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                NFC
              </button>
            </div>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {filteredTeams.map((team) => (
              <Link
                key={team.TeamID}
                href={`/teams/${team.Key}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-xl transition-all transform hover:-translate-y-1"
                style={{ borderTop: `4px solid #${team.PrimaryColor || '000000'}` }}
              >
                <div className="text-center">
                  {team.WikipediaLogoUrl && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
                      <Image
                        src={team.WikipediaLogoUrl}
                        alt={team.FullName}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                    {team.FullName}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{team.Key}</p>
                  {team.record && (
                    <p className="text-sm sm:text-base font-bold text-blue-600 mb-2">{team.record}</p>
                  )}
                  <div className="text-xs text-gray-400">{team.Conference} • {team.Division}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No results message */}
        {!loading && filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No teams found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

