import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
        <div className="text-slate-300 text-lg font-medium">Loading NeoMarket...</div>
      </div>
    </div>
  );
}
