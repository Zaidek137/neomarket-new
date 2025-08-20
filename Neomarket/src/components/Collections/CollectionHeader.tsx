import React from 'react';

export default function CollectionHeader() {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
      <div className="px-4 lg:px-6 xl:px-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Collections
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Discover unique digital collections from verified creators and emerging artists in the NeoMarket ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}
