import { useState, useEffect } from 'react';
import { Vote, Users, Clock, CheckCircle, AlertCircle, TrendingUp, Plus, Music, Gamepad2, Building, Palette, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useActiveAccount } from 'thirdweb/react';
import { votingService, Proposal, ProposalCategory, VoteType } from '../services/supabase';
import { useEkoOwnership } from '../hooks/useEkoOwnership';
import { isAdminWallet } from '../config/admin';
import CreateProposalModal from './CreateProposalModal';
import ProposalDetailModal from './ProposalDetailModal';

export default function NexusPage() {
  const account = useActiveAccount();
  const { ownsEko, loading: ekoLoading } = useEkoOwnership();
  const isAdmin = isAdminWallet(account?.address);
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');
  const [selectedCategory, setSelectedCategory] = useState<ProposalCategory | 'all'>('all');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, VoteType>>({});

  // Category configuration
  const categories = [
    { value: 'all', label: 'All Categories', icon: Vote, color: 'purple' },
    { value: 'music', label: 'Music & Videos', icon: Music, color: 'pink' },
    { value: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'green' },
    { value: 'city_voting', label: 'City Voting', icon: Building, color: 'blue' },
    { value: 'creative_content', label: 'Creative Content', icon: Palette, color: 'orange' }
  ];

  // Load proposals
  useEffect(() => {
    loadProposals();
  }, [selectedCategory]);

  // Load user votes
  useEffect(() => {
    if (account?.address) {
      loadUserVotes();
    }
  }, [account?.address]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await votingService.getProposals(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async () => {
    if (!account?.address) return;
    
    try {
      const votes = await votingService.getVotesByWallet(account.address);
      const voteMap: Record<string, VoteType> = {};
      votes.forEach((vote: any) => {
        voteMap[vote.proposal_id] = vote.vote_type;
      });
      setUserVotes(voteMap);
    } catch (error) {
      console.error('Error loading user votes:', error);
    }
  };

  const handleVote = async (proposalId: string, voteType: VoteType) => {
    if (!account?.address || !ownsEko) return;

    try {
      setVoting(proposalId);
      
      await votingService.submitVote(proposalId, account.address, voteType);
      
      // Update local state
      setUserVotes({ ...userVotes, [proposalId]: voteType });
      
      // Reload proposals to get updated counts
      await loadProposals();
    } catch (error) {
      console.error('Error voting:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit vote');
    } finally {
      setVoting(null);
    }
  };

  const handleCardClick = (proposal: Proposal, e: React.MouseEvent) => {
    // Don't open modal if clicking on buttons or admin controls
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedProposal(proposal);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProposal(null);
  };

  const handleDeleteProposal = async (proposalId: string) => {
    if (!account?.address || !isAdmin) return;

    const confirmed = window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(proposalId);
      
      await votingService.deleteProposal(proposalId, account.address);
      
      // Reload proposals to remove the deleted one
      await loadProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete proposal');
    } finally {
      setDeleting(null);
    }
  };

  const activeProposals = proposals.filter(p => p.status === 'active');
  const historyProposals = proposals.filter(p => p.status !== 'active');

  const getCategoryColor = (category: ProposalCategory) => {
    const cat = categories.find(c => c.value === category);
    switch (cat?.color) {
      case 'pink': return 'bg-pink-500/50 text-pink-200 border-pink-400/70 shadow-lg shadow-pink-500/30';
      case 'green': return 'bg-green-500/50 text-green-200 border-green-400/70 shadow-lg shadow-green-500/30';
      case 'blue': return 'bg-blue-500/50 text-blue-200 border-blue-400/70 shadow-lg shadow-blue-500/30';
      case 'orange': return 'bg-orange-500/50 text-orange-200 border-orange-400/70 shadow-lg shadow-orange-500/30';
      default: return 'bg-purple-500/50 text-purple-200 border-purple-400/70 shadow-lg shadow-purple-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="text-yellow-400" size={16} />;
      case 'passed': return <CheckCircle className="text-green-400" size={16} />;
      case 'failed': return <AlertCircle className="text-red-400" size={16} />;
      default: return <Clock className="text-slate-400" size={16} />;
    }
  };

  const calculateProgress = (proposal: Proposal) => {
    // Calculate progress based on votes_for vs votes_required
    if (proposal.votes_required === 0) return 0;
    return Math.min((proposal.votes_for / proposal.votes_required) * 100, 100);
  };

  const displayProposals = selectedTab === 'active' ? activeProposals : historyProposals;

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Vote className="text-purple-400 w-6 h-6 sm:w-8 sm:h-8" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white">The Nexus</h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-400">Shape the future of the Scavenjer ecosystem</p>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">Create Proposal</span>
          </button>
        )}
      </div>

      {/* Wallet Connection Check */}
      {!account ? (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
          <div className="space-y-3">
            <Vote className="text-yellow-400 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
            <p className="text-slate-400">
              You need to connect your wallet to participate in voting.
            </p>
          </div>
        </div>
      ) : !ekoLoading && !ownsEko ? (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
          <div className="space-y-3">
            <AlertCircle className="text-yellow-400 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-white">Eko Required</h3>
            <p className="text-slate-400">
              You need to own at least one Eko NFT to participate in voting.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Category Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value as ProposalCategory | 'all')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-xs sm:text-sm ${
                    selectedCategory === category.value
                      ? 'bg-slate-700/50 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden xs:inline">{category.label}</span>
                  <span className="xs:hidden">{category.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
                <Users className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{proposals.length}</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-slate-400">Total</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
                <Vote className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{activeProposals.length}</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-slate-400">Active</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
                <TrendingUp className="text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{Object.keys(userVotes).length}</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-slate-400">Voted</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setSelectedTab('active')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors text-sm sm:text-base ${
                selectedTab === 'active'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="sm:hidden">Active ({activeProposals.length})</span>
              <span className="hidden sm:inline">Active Proposals ({activeProposals.length})</span>
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors text-sm sm:text-base ${
                selectedTab === 'history'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="sm:hidden">History ({historyProposals.length})</span>
              <span className="hidden sm:inline">Voting History ({historyProposals.length})</span>
            </button>
          </div>

          {/* Proposals Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading proposals...</p>
            </div>
          ) : displayProposals.length === 0 ? (
            <div className="text-center py-12">
              <Vote className="text-slate-500 mx-auto mb-4" size={64} />
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedTab === 'active' ? 'No Active Proposals' : 'No Voting History'}
              </h3>
              <p className="text-slate-400">
                {selectedTab === 'active' 
                  ? 'Check back later for new proposals to vote on.' 
                  : 'Participate in active proposals to build your voting history.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {displayProposals.map((proposal) => (
                <motion.div 
                  key={proposal.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: displayProposals.indexOf(proposal) * 0.1 }}
                  onClick={(e) => handleCardClick(proposal, e)}
                  className="bg-slate-900/70 border-2 border-yellow-500/30 rounded-xl hover:bg-slate-900/90 hover:border-yellow-400/60 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 hover:scale-[1.03] overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Large Image at Top */}
                  {proposal.image_url && (
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={proposal.image_url} 
                        alt={proposal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      
                      {/* Category badge over image */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(proposal.category)}`}>
                          {proposal.category.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {/* Admin delete button over image */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteProposal(proposal.id)}
                          disabled={deleting === proposal.id}
                          className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-1.5 rounded-lg transition-colors backdrop-blur-sm"
                          title="Delete Proposal"
                        >
                          {deleting === proposal.id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    {/* Header without image (when no image) */}
                    {!proposal.image_url && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(proposal.category)}`}>
                          {proposal.category.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(proposal.status)}
                          <span className="text-xs text-slate-400 capitalize">{proposal.status}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteProposal(proposal.id)}
                            disabled={deleting === proposal.id}
                            className="ml-auto bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-1.5 rounded-lg transition-colors"
                            title="Delete Proposal"
                          >
                            {deleting === proposal.id ? (
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Title and Status */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        {proposal.image_url && (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(proposal.status)}
                            <span className="text-xs text-slate-400 capitalize">{proposal.status}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
                        {proposal.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{proposal.description}</p>
                    </div>
                    
                    {/* Voting Progress */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">
                          {proposal.votes_for}/{proposal.votes_required}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(proposal)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>👍 {proposal.votes_for}</span>
                        <span>👎 {proposal.votes_against}</span>
                      </div>
                    </div>
                    
                    {/* Voting Actions */}
                    <div className="mt-auto">
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
                            <div className="grid grid-cols-2 gap-2">
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleVote(proposal.id, 'for')}
                                disabled={voting === proposal.id}
                                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 text-xs shadow-lg hover:shadow-green-500/25"
                              >
                                {voting === proposal.id ? (
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                  '👍 For'
                                )}
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleVote(proposal.id, 'against')}
                                disabled={voting === proposal.id}
                                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 text-xs shadow-lg hover:shadow-red-500/25"
                              >
                                {voting === proposal.id ? (
                                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                  '👎 Against'
                                )}
                              </motion.button>
                            </div>
                          )}
                          <div className="text-xs text-slate-400 text-center bg-slate-700/30 px-2 py-1 rounded">
                            <Clock size={10} className="inline mr-1" />
                            {new Date(proposal.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      
                      {/* Non-Eko holder message */}
                      {proposal.status === 'active' && !ekoLoading && !ownsEko && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-2 rounded-lg text-center text-xs">
                          🔒 Hold Eko to vote
                        </div>
                      )}
                      
                      {/* Inactive proposal */}
                      {proposal.status !== 'active' && (
                        <div className="bg-slate-700/30 text-slate-400 px-3 py-2 rounded-lg text-center text-xs">
                          {proposal.status === 'passed' ? '✅ Passed' : proposal.status === 'failed' ? '❌ Failed' : 'Closed'}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProposalCreated={loadProposals}
      />

      {/* Proposal Detail Modal */}
      <ProposalDetailModal
        proposal={selectedProposal}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        onVote={handleVote}
        onDelete={handleDeleteProposal}
        userVotes={userVotes}
        voting={voting}
        deleting={deleting}
      />
    </div>
  );
}