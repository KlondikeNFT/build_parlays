'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, Users, Loader2 } from 'lucide-react';

interface SearchResult {
  players: Array<{
    PlayerID: number;
    FirstName: string;
    LastName: string;
    Position: string;
    Team: string;
    Number: number;
    PhotoUrl: string;
  }>;
  teams: Array<{
    TeamID: number;
    Key: string;
    City: string;
    Name: string;
    FullName: string;
    PrimaryColor: string;
    SecondaryColor: string;
  }>;
  totalResults: number;
  query: string;
}

interface SearchDropdownProps {
  onClose: () => void;
  className?: string;
}

export default function SearchDropdown({ onClose, className = '' }: SearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results) return;

    const totalItems = results.players.length + results.teams.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const itemIndex = selectedIndex;
          if (itemIndex < results.players.length) {
            const player = results.players[itemIndex];
            window.location.href = `/players/${player.PlayerID}?team=${player.Team}&name=${encodeURIComponent(`${player.FirstName} ${player.LastName}`)}`;
          } else {
            const teamIndex = itemIndex - results.players.length;
            const team = results.teams[teamIndex];
            window.location.href = `/teams/${team.Key}`;
          }
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getItemHref = (item: any, index: number) => {
    if (index < results!.players.length) {
      const player = item;
      return `/players/${player.PlayerID}?team=${player.Team}&name=${encodeURIComponent(`${player.FirstName} ${player.LastName}`)}`;
    } else {
      const team = item;
      return `/teams/${team.Key}`;
    }
  };

  const getItemContent = (item: any, index: number) => {
    if (index < results!.players.length) {
      const player = item;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {player.PhotoUrl ? (
              <Image
                src={player.PhotoUrl}
                alt={`${player.FirstName} ${player.LastName}`}
                width={32}
                height={32}
                className="rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold ${player.PhotoUrl ? 'hidden' : ''}`}>
              {player.Number}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 truncate">
                {player.FirstName} {player.LastName}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {player.Position} • {player.Team}
            </p>
          </div>
        </div>
      );
    } else {
      const team = item;
      return (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: team.PrimaryColor }}
            >
              {team.Key}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 truncate">
                {team.FullName}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              {team.Conference} {team.Division}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20 ${className}`}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search players and teams..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Type at least 2 characters to search</p>
            </div>
          ) : results && results.totalResults > 0 ? (
            <div className="py-2">
              {/* Players Section */}
              {results.players.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Players ({results.players.length})
                    </h3>
                  </div>
                  {results.players.map((player, index) => (
                    <Link
                      key={player.PlayerID}
                      href={getItemHref(player, index)}
                      className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedIndex === index ? 'bg-blue-50' : ''
                      }`}
                      onClick={onClose}
                    >
                      {getItemContent(player, index)}
                    </Link>
                  ))}
                </>
              )}

              {/* Teams Section */}
              {results.teams.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Teams ({results.teams.length})
                    </h3>
                  </div>
                  {results.teams.map((team, index) => (
                    <Link
                      key={team.TeamID}
                      href={getItemHref(team, results.players.length + index)}
                      className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selectedIndex === results.players.length + index ? 'bg-blue-50' : ''
                      }`}
                      onClick={onClose}
                    >
                      {getItemContent(team, results.players.length + index)}
                    </Link>
                  ))}
                </>
              )}
            </div>
          ) : results && results.totalResults === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try searching for a player name or team</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            {results && (
              <span>{results.totalResults} result{results.totalResults !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


