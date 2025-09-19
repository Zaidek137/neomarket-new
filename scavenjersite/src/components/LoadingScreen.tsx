import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [count, setCount] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => Math.max(0, prev - 1));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#111111] z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Timer Display */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] opacity-10 blur-lg"></div>
          <div className="relative font-mono text-[#2DD4BF] tracking-widest">
            <span className="text-5xl font-light tabular-nums">
              {count.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-[#2DD4BF]/60 text-xs tracking-[0.2em] font-mono">
          SYSTEM LOADING
        </div>
      </div>
    </div>
  );
}