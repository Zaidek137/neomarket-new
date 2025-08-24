import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Vote, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Music, Gamepad2, Building, Palette, Trash2 } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { Proposal, VoteType } from '../services/supabase';
import { useEkoOwnership } from '../hooks/useEkoOwnership';
import { isAdminWallet } from '../config/admin';

interface ProposalDetailModalProps {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: () => void;
  onVote: (proposalId: string, voteType: VoteType) => Promise<void>;
  onDelete: (proposalId: string) => Promise<void>;
  userVotes: Record<string, VoteType>;
  voting: string | null;
  deleting: string | null;
}

export default function ProposalDetailModal({
  proposal,
  isOpen,
  onClose,
  onVote,
  onDelete,
  userVotes,
  voting,
  deleting
}: ProposalDetailModalProps) {
  const account = useActiveAccount();
  const { ownsEko, loading: ekoLoading } = useEkoOwnership();
  const isAdmin = isAdminWallet(account?.address);

  if (!proposal) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'music': return 'bg-pink-500/50 text-pink-200 border-pink-400/70 shadow-lg shadow-pink-500/30';
      case 'gaming': return 'bg-green-500/50 text-green-200 border-green-400/70 shadow-lg shadow-green-500/30';
      case 'city_voting': return 'bg-blue-500/50 text-blue-200 border-blue-400/70 shadow-lg shadow-blue-500/30';
      case 'creative_content': return 'bg-orange-500/50 text-orange-200 border-orange-400/70 shadow-lg shadow-orange-500/30';
      default: return 'bg-purple-500/50 text-purple-200 border-purple-400/70 shadow-lg shadow-purple-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'music': return <Music size={20} />;
      case 'gaming': return <Gamepad2 size={20} />;
      case 'city_voting': return <Building size={20} />;
      case 'creative_content': return <Palette size={20} />;
      default: return <Vote size={20} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="text-green-400" size={16} />;
      case 'passed': return <CheckCircle className="text-green-400" size={16} />;
      case 'failed': return <AlertCircle className="text-red-400" size={16} />;
      default: return <Clock className="text-slate-400" size={16} />;
    }
  };

  const calculateProgress = (proposal: Proposal) => {
    return Math.min((proposal.votes_for / proposal.votes_required) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/95 border-2 border-yellow-500/40 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden backdrop-blur-md shadow-2xl shadow-yellow-500/10"
          >
            {/* Header */}
            <div className="relative p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getCategoryColor(proposal.category)}`}>
                    {getCategoryIcon(proposal.category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(proposal.category)}`}>
                        {proposal.category.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(proposal.status)}
                        <span className="text-xs text-slate-300 capitalize">{proposal.status}</span>
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1 line-clamp-1">{proposal.title}</h2>
                    <p className="text-slate-400 text-xs">
                      {proposal.created_by.slice(0, 6)}...{proposal.created_by.slice(-4)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(proposal.id)}
                      disabled={deleting === proposal.id}
                      className="bg-red-600/80 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-1.5 rounded transition-colors"
                      title="Delete Proposal"
                    >
                      {deleting === proposal.id ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-slate-700/50 hover:bg-slate-700 text-white p-1.5 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="p-4 space-y-4">
                {/* Image */}
                {proposal.image_url && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img 
                      src={proposal.image_url} 
                      alt={proposal.title}
                      className="w-full h-64 object-contain bg-slate-800/50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">{proposal.description}</p>
                </div>

                {/* Voting Progress */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Voting Progress</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 text-sm">Progress to Pass</span>
                      <span className="text-white font-semibold text-sm">
                        {proposal.votes_for} / {proposal.votes_required}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress(proposal)}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-400">{proposal.votes_for}</div>
                        <div className="text-xs text-green-300">👍 For</div>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-red-400">{proposal.votes_against}</div>
                        <div className="text-xs text-red-300">👎 Against</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Created:</span>
                      <span className="text-white">{new Date(proposal.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Ends:</span>
                      <span className="text-white">{new Date(proposal.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Voting */}
            <div className="border-t border-slate-700/50 p-4">
              {proposal.status === 'active' && ownsEko && (
                <div className="space-y-3">
                  {userVotes[proposal.id] ? (
                    <div className={`px-4 py-3 rounded-lg text-center text-sm font-medium border ${
                      userVotes[proposal.id] === 'for' 
                        ? 'bg-green-600/20 text-green-400 border-green-500/30' 
                        : 'bg-red-600/20 text-red-400 border-red-500/30'
                    }`}>
                      ✓ You voted {userVotes[proposal.id]}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onVote(proposal.id, 'for')}
                        disabled={voting === proposal.id}
                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-green-500/25"
                      >
                        {voting === proposal.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                          '👍 Vote For'
                        )}
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onVote(proposal.id, 'against')}
                        disabled={voting === proposal.id}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-red-500/25"
                      >
                        {voting === proposal.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                          '👎 Vote Against'
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
              
              {proposal.status === 'active' && !ekoLoading && !ownsEko && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-lg text-center text-sm">
                  🔒 Hold an Eko NFT to participate in voting
                </div>
              )}
              
              {proposal.status !== 'active' && (
                <div className="bg-slate-700/30 text-slate-400 px-4 py-3 rounded-lg text-center text-sm">
                  Voting {proposal.status === 'passed' ? '✅ Passed' : proposal.status === 'failed' ? '❌ Failed' : 'Closed'}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
