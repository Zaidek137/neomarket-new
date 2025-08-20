import React from 'react';
import { Gavel, Clock } from 'lucide-react';

export default function AuctionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Gavel className="text-amber-400" size={32} />
        <h1 className="text-3xl font-bold text-white">Auctions</h1>
      </div>

      {/* Coming Soon Section */}
      <div className="flex flex-col items-center justify-center py-32">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center max-w-md">
          <div className="mb-6">
            <Gavel className="text-amber-400 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2">Auctions Coming Soon</h2>
            <p className="text-slate-400 leading-relaxed">
              Auction functionality is currently in development. Soon you'll be able to bid on exclusive Ekos and rare collectibles in timed auctions.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Clock size={16} />
            <span>Feature in development</span>
          </div>
        </div>
      </div>
    </div>
  );
}
