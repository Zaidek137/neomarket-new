import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { ConnectButton } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';
import { client } from '../../client';
import { cn } from '../../lib/utils';

export default function TopHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Configure external wallets
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("walletConnect"),
    createWallet("com.trustwallet.app"),
  ];

  // Global search hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchFocused) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);



  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
      <div className="px-4 lg:px-6 max-w-full overflow-hidden">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Navigation */}
          <div className="flex items-center">
            {/* Back to Homepage Link */}
            <a 
              href="https://www.scavenjer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Scavenjer.com
            </a>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-sm mx-4">
            <div className={cn(
              "relative transition-all duration-300",
              searchFocused && "transform scale-105"
            )}>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="global-search"
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={cn(
                  "w-full pl-9 pr-10 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg",
                  "text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20",
                  "transition-all duration-300 backdrop-blur-sm text-sm",
                  searchFocused && "shadow-lg shadow-cyan-500/10"
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <kbd className="px-1.5 py-0.5 text-xs bg-slate-700/80 text-slate-300 rounded border border-slate-600/50">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-300 relative">
              <Bell size={18} className="text-slate-400 hover:text-cyan-400 transition-colors duration-300" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
            </button>

            {/* Wallet Connection - Single ThirdWeb UI */}
            <div className="flex-shrink-0">
              <ConnectButton 
                client={client}
                wallets={wallets}
                connectModal={{
                  size: "compact",
                  showThirdwebBranding: false,
                  welcomeScreen: {
                    title: "Connect your wallet",
                    subtitle: "Select an external wallet to continue",
                  }
                }}
                connectButton={{
                  style: {
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.5rem 0.75rem',
                    backdropFilter: 'blur(8px)',
                    minWidth: '100px',
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
