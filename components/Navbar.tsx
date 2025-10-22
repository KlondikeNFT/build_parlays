'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, User, Users, Loader2 } from 'lucide-react';
import Image from 'next/image';

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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    setIsSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await response.json();
        setSearchResults(data);
        setShowSearchResults(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults(null);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults) return;

    const totalItems = searchResults.players.length + searchResults.teams.length;

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
          if (itemIndex < searchResults.players.length) {
            const player = searchResults.players[itemIndex];
            window.location.href = `/players/${player.PlayerID}?team=${player.Team}&name=${encodeURIComponent(`${player.FirstName} ${player.LastName}`)}`;
          } else {
            const teamIndex = itemIndex - searchResults.players.length;
            const team = searchResults.teams[teamIndex];
            window.location.href = `/teams/${team.Key}`;
          }
        }
        break;
      case 'Escape':
        setSearchQuery('');
        setShowSearchResults(false);
        setSearchResults(null);
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getItemHref = (item: any, index: number) => {
    if (index < searchResults!.players.length) {
      const player = item;
      return `/players/${player.PlayerID}?team=${player.Team}&name=${encodeURIComponent(`${player.FirstName} ${player.LastName}`)}`;
    } else {
      const team = item;
      return `/teams/${team.Key}`;
    }
  };

  const getItemContent = (item: any, index: number) => {
    if (index < searchResults!.players.length) {
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
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              BuildParlays
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/teams" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Teams
            </Link>
            <Link 
              href="/schedule" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Schedule
            </Link>
            <Link 
              href="/about" 
              className="hover:text-blue-200 transition-colors font-medium"
            >
              About
            </Link>
            
            {/* Search Input */}
            <div className="relative" ref={searchResultsRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-200" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search teams, players..."
                  className="bg-blue-800 bg-opacity-50 text-white placeholder-blue-200 rounded-full px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
                />
                {isSearchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5 animate-spin" />
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {searchResults.totalResults > 0 ? (
                    <div className="py-2">
                      {/* Players Section */}
                      {searchResults.players.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Players ({searchResults.players.length})
                            </h3>
                          </div>
                          {searchResults.players.map((player, index) => (
                            <Link
                              key={player.PlayerID}
                              href={getItemHref(player, index)}
                              className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                                selectedIndex === index ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                setSearchQuery('');
                                setShowSearchResults(false);
                                setSearchResults(null);
                              }}
                            >
                              {getItemContent(player, index)}
                            </Link>
                          ))}
                        </>
                      )}

                      {/* Teams Section */}
                      {searchResults.teams.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Teams ({searchResults.teams.length})
                            </h3>
                          </div>
                          {searchResults.teams.map((team, index) => (
                            <Link
                              key={team.TeamID}
                              href={getItemHref(team, searchResults.players.length + index)}
                              className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                                selectedIndex === searchResults.players.length + index ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                setSearchQuery('');
                                setShowSearchResults(false);
                                setSearchResults(null);
                              }}
                            >
                              {getItemContent(team, searchResults.players.length + index)}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No results found for &quot;{searchQuery}&quot;</p>
                      <p className="text-sm mt-1">Try searching for a player name or team</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-700">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <Link
              href="/teams"
              className="block py-2 hover:text-blue-200 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Teams
            </Link>
            <Link
              href="/schedule"
              className="block py-2 hover:text-blue-200 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Schedule
            </Link>
            <Link
              href="/about"
              className="block py-2 hover:text-blue-200 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile Search Input */}
            <div className="relative mt-2" ref={searchResultsRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search teams, players..."
                  className="w-full bg-blue-900 bg-opacity-50 text-white placeholder-blue-200 rounded-full px-4 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {isSearchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-5 h-5 animate-spin" />
                )}
              </div>
              
              {/* Mobile Search Results Dropdown */}
              {showSearchResults && searchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {searchResults.totalResults > 0 ? (
                    <div className="py-2">
                      {/* Players Section */}
                      {searchResults.players.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Players ({searchResults.players.length})
                            </h3>
                          </div>
                          {searchResults.players.map((player, index) => (
                            <Link
                              key={player.PlayerID}
                              href={getItemHref(player, index)}
                              className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                                selectedIndex === index ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                setSearchQuery('');
                                setShowSearchResults(false);
                                setSearchResults(null);
                                setIsMenuOpen(false);
                              }}
                            >
                              {getItemContent(player, index)}
                            </Link>
                          ))}
                        </>
                      )}

                      {/* Teams Section */}
                      {searchResults.teams.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Teams ({searchResults.teams.length})
                            </h3>
                          </div>
                          {searchResults.teams.map((team, index) => (
                            <Link
                              key={team.TeamID}
                              href={getItemHref(team, searchResults.players.length + index)}
                              className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                                selectedIndex === searchResults.players.length + index ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => {
                                setSearchQuery('');
                                setShowSearchResults(false);
                                setSearchResults(null);
                                setIsMenuOpen(false);
                              }}
                            >
                              {getItemContent(team, searchResults.players.length + index)}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No results found for &quot;{searchQuery}&quot;</p>
                      <p className="text-sm mt-1">Try searching for a player name or team</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}


