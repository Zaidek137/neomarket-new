import React from 'react';

export default function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Layer - Keep black */}
      <div className="absolute inset-0 bg-black" />

      {/* Deep Ocean Gradients */}
      <div className="absolute inset-0">
        {/* Primary Ocean Layers - Using new blue color */}
        <div className="absolute inset-0">
          {/* Deep Layer */}
          <div 
            className="absolute inset-0 bg-gradient-radial from-[#062f70] via-[#041d45] to-transparent opacity-60"
            style={{ 
              animation: 'oceanPulse 8s ease-in-out infinite',
              transformOrigin: 'center'
            }}
          />
          
          {/* Mid Layer */}
          <div 
            className="absolute inset-0 bg-gradient-radial from-[#062f70] via-[#052555] to-transparent opacity-50"
            style={{ 
              animation: 'oceanFlow 12s ease-in-out infinite',
              transformOrigin: '30% 70%'
            }}
          />
          
          {/* Surface Layer */}
          <div 
            className="absolute inset-0 bg-gradient-radial from-[#073785] via-[#062f70] to-transparent opacity-40"
            style={{ 
              animation: 'oceanSurge 10s ease-in-out infinite',
              transformOrigin: '70% 30%'
            }}
          />
        </div>

        {/* Dynamic Ocean Areas */}
        <div className="absolute inset-0">
          {/* Large Area 1 */}
          <div 
            className="absolute top-0 left-0 w-2/3 h-2/3 bg-gradient-radial from-[#062f70] via-[#052555] to-transparent opacity-50"
            style={{ animation: 'oceanMove1 15s ease-in-out infinite' }}
          />
          
          {/* Large Area 2 */}
          <div 
            className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-radial from-[#062f70] via-[#041d45] to-transparent opacity-50"
            style={{ animation: 'oceanMove2 18s ease-in-out infinite' }}
          />
          
          {/* Accent Areas */}
          <div 
            className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-gradient-radial from-[#073785] via-[#062f70] to-transparent opacity-30"
            style={{ animation: 'oceanAccent 20s ease-in-out infinite' }}
          />
        </div>

        {/* Animated Overlay Effects */}
        <div className="absolute inset-0">
          {/* Shimmer Effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-[#062f70]/10 to-transparent"
            style={{ animation: 'shimmer 6s ease-in-out infinite' }}
          />
          
          {/* Wave Effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#073785]/10 to-transparent"
            style={{ animation: 'wave 8s ease-in-out infinite' }}
          />
        </div>
      </div>

      {/* Animated Lines */}
      <div className="absolute inset-0">
        {/* Horizontal Lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-[1px] w-[300px]"
            style={{
              top: `${10 + i * 8}%`,
              background: `linear-gradient(90deg, transparent, rgba(6, 47, 112, 0.5), transparent)`,
              transform: 'translateY(-50%)',
              animation: `moveHorizontal ${25 + i * 3}s linear infinite`,
              opacity: 0.6
            }}
          />
        ))}

        {/* Diagonal Lines */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`d-${i}`}
            className="absolute h-[1px] w-[400px]"
            style={{
              top: '50%',
              left: `${i * 12}%`,
              background: `linear-gradient(90deg, transparent, rgba(6, 47, 112, 0.5), transparent)`,
              transform: `rotate(45deg) translateY(${i * 120}px)`,
              animation: `moveDiagonal ${30 + i * 2}s linear infinite`,
              opacity: 0.5
            }}
          />
        ))}
      </div>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes oceanPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.05); opacity: 0.7; }
          }

          @keyframes oceanFlow {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(1%, 1%) scale(1.03); }
          }

          @keyframes oceanSurge {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-1%, 1%) rotate(1deg); }
          }

          @keyframes oceanMove1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(2%, 2%) scale(1.1); }
          }

          @keyframes oceanMove2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-2%, -1%) scale(1.1); }
          }

          @keyframes oceanAccent {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(-1%, 1%) rotate(2deg); }
          }

          @keyframes shimmer {
            0%, 100% { opacity: 0.3; transform: translateY(0); }
            50% { opacity: 0.5; transform: translateY(-10px); }
          }

          @keyframes wave {
            0%, 100% { opacity: 0.3; transform: translateX(0); }
            50% { opacity: 0.5; transform: translateX(10px); }
          }

          @keyframes moveHorizontal {
            from { transform: translateX(-100%) translateY(-50%); }
            to { transform: translateX(100vw) translateY(-50%); }
          }

          @keyframes moveDiagonal {
            from { transform: rotate(45deg) translateX(-100vw); }
            to { transform: rotate(45deg) translateX(100vw); }
          }
        `}
      </style>
    </div>
  );
}