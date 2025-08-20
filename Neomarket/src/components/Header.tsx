import { Link } from 'react-router-dom';
import { ConnectButton } from 'thirdweb/react';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  client: any;
}

export default function Header({ client }: HeaderProps) {

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-white">NeoMarket</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/explore" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Explore
            </Link>
            <Link 
              to="/create" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Create
            </Link>
            <Link 
              to="/stats" 
              className="text-slate-300 hover:text-white transition-colors"
            >
              Stats
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items, collections, and accounts"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ConnectButton client={client} />
            <button className="p-2 text-slate-400 hover:text-white">
              <UserIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
