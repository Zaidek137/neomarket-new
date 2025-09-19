import React from 'react';

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] rounded-lg opacity-20 blur-xl animate-pulse"></div>
        <div className="relative text-[#2DD4BF] text-lg">Loading NFTs...</div>
      </div>
    </div>
  );
}