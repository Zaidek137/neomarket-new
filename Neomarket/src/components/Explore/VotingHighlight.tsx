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
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          {/* Left Content */}
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/30">
              <Vote className="text-purple-400" size={32} />
            </div>
            
            {/* Text Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Vote with Your Eko
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Hold an Eko to participate in governance decisions and shape the future of the Scavenjer ecosystem through community voting.
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>1,250+ Voters</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy size={14} />
                  <span>Active Proposals</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Action */}
          <button 
            onClick={() => navigate('/voting-circuit')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <span>Enter Voting Circuit</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
