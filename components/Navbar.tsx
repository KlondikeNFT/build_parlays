'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
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
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams, players..."
                className="bg-blue-800 bg-opacity-50 text-white placeholder-blue-200 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-300 w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-blue-200" />
            </form>
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
            
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="relative pt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams, players..."
                className="w-full bg-blue-900 bg-opacity-50 text-white placeholder-blue-200 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <Search className="absolute left-3 top-4.5 h-5 w-5 text-blue-200" />
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}


