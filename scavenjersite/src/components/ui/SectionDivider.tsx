import React from 'react';
import { motion } from 'framer-motion';

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className = '' }: SectionDividerProps) {
  return (
    <div className={`relative w-full h-24 ${className}`}>
      {/* Gradient Line */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-px"
        >
          {/* Base Line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2DD4BF]/20 to-transparent" />
          
          {/* Glow Effect */}
          <div className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-[#2DD4BF]/10 to-transparent blur-sm" />
          
          {/* Center Dot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute -inset-2 bg-[#2DD4BF] rounded-full opacity-20 blur-lg"></div>
              <div className="relative w-2 h-2 rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#EC4899]"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}