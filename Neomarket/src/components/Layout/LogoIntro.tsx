import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoIntroProps {
  onComplete: () => void;
}

export default function LogoIntro({ onComplete }: LogoIntroProps) {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // For testing - let's temporarily always show the animation
    console.log('LogoIntro: Always showing animation for testing'); // Debug log
    
    // Clear any existing storage to ensure it shows
    sessionStorage.removeItem('neomarket-logo-intro-seen');
    
    setShowIntro(true);
    
    // Complete the animation after 3 seconds
    const timer = setTimeout(() => {
      console.log('LogoIntro: Animation completed'); // Debug log
      setShowIntro(false);
      onComplete();
      // Mark as seen after animation completes
      sessionStorage.setItem('neomarket-logo-intro-seen', 'true');
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!showIntro) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Radial gradient pulse */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"
            style={{ transform: 'translate(-50%, -50%)' }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Main Logo Animation */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: ["-180deg", "0deg", "0deg"],
            opacity: [0, 1, 1]
          }}
          transition={{
            duration: 1.5,
            times: [0, 0.6, 1],
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Glow effect behind logo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Logo image */}
          <motion.img 
            src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Neomarket%20Log.png"
            alt="NeoMarket Logo"
            className="w-72 h-48 object-contain relative z-10 drop-shadow-2xl"
            animate={{
              filter: [
                "drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))",
                "drop-shadow(0 0 40px rgba(6, 182, 212, 0.8))",
                "drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>



        {/* Exit Animation - Spin to corner */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          exit={{
            opacity: 1,
            transition: { duration: 0.1 }
          }}
        >
          <motion.div
            className="absolute top-1/2 left-1/2"
            style={{ transform: 'translate(-50%, -50%)' }}
            exit={{
              x: ['0%', 'calc(-50vw + 4rem)'],
              y: ['0%', 'calc(-50vh + 3rem)'],
              scale: [1, 0.15],
              rotate: [0, 720],
              transition: {
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 1]
              }
            }}
          >
            <motion.img 
              src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Neomarket%20Log.png"
              alt="NeoMarket Logo"
              className="w-72 h-48 object-contain"
              exit={{
                filter: [
                  "drop-shadow(0 0 40px rgba(6, 182, 212, 0.8))",
                  "drop-shadow(0 0 0px rgba(6, 182, 212, 0))"
                ],
                transition: { duration: 1.2 }
              }}
            />
          </motion.div>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
