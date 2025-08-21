import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Users, Trophy, ChevronRight } from 'lucide-react';

export default function VotingHighlight() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 rounded-xl overflow-hidden border border-purple-500/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
      
      {/* Content */}
      <div className="relative p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left Content */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            {/* Icon */}
            <div className="bg-purple-500/20 p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border border-purple-500/30 flex-shrink-0">
              <Vote className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
            </div>
            
            {/* Text Content */}
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white">
                Vote with Your Eko
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-full sm:max-w-md">
                Hold an Eko to participate in governance decisions and shape the future of the Scavenjer ecosystem through community voting.
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-400">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Users size={12} className="sm:w-[14px] sm:h-[14px]" />
                  <span>1,250+ Voters</span>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Trophy size={12} className="sm:w-[14px] sm:h-[14px]" />
                  <span>Active Proposals</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Action */}
          <button 
            onClick={() => navigate('/nexus')}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 shadow-lg text-sm sm:text-base"
          >
            <span>Enter The Nexus</span>
            <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
