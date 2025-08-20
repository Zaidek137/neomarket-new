import React, { useState } from 'react';
import { Vote, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'governance' | 'development' | 'community';
  status: 'active' | 'passed' | 'failed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endDate: string;
  requiredEkos: number;
}

export default function VotingCircuitPage() {
  const account = useActiveAccount();
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

  // Mock proposals data
  const proposals: Proposal[] = [
    {
      id: '1',
      title: 'Expand Dark Circuit Rewards',
      description: 'Increase rewards for Dark Circuit participants by 25% to incentivize more competitive gameplay.',
      category: 'governance',
      status: 'active',
      votesFor: 850,
      votesAgainst: 320,
      totalVotes: 1170,
      endDate: '2024-01-15',
      requiredEkos: 1
    },
    {
      id: '2',
      title: 'New Trait System Implementation',
      description: 'Implement a dynamic trait evolution system for Ekos based on participation and achievements.',
      category: 'development',
      status: 'active',
      votesFor: 1240,
      votesAgainst: 180,
      totalVotes: 1420,
      endDate: '2024-01-20',
      requiredEkos: 1
    },
    {
      id: '3',
      title: 'Community Events Funding',
      description: 'Allocate 50 MATIC from treasury for monthly community events and tournaments.',
      category: 'community',
      status: 'passed',
      votesFor: 1850,
      votesAgainst: 410,
      totalVotes: 2260,
      endDate: '2023-12-30',
      requiredEkos: 1
    }
  ];

  const activeProposals = proposals.filter(p => p.status === 'active');
  const historyProposals = proposals.filter(p => p.status !== 'active');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'governance': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'development': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'community': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Vote className="text-purple-400" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-white">Voting Circuit</h1>
          <p className="text-slate-400">Shape the future of the Scavenjer ecosystem</p>
        </div>
      </div>

      {/* Wallet Connection Check */}
      {!account ? (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 text-center">
          <div className="space-y-3">
            <Vote className="text-yellow-400 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
            <p className="text-slate-400">
              You need to connect your wallet and own at least one Eko to participate in voting.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Users className="text-cyan-400" size={24} />
                <div>
                  <div className="text-2xl font-bold text-white">1,250</div>
                  <div className="text-sm text-slate-400">Active Voters</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Vote className="text-purple-400" size={24} />
                <div>
                  <div className="text-2xl font-bold text-white">{activeProposals.length}</div>
                  <div className="text-sm text-slate-400">Active Proposals</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-400" size={24} />
                <div>
                  <div className="text-2xl font-bold text-white">78%</div>
                  <div className="text-sm text-slate-400">Participation Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setSelectedTab('active')}
              className={`px-6 py-3 font-medium transition-colors ${
                selectedTab === 'active'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Proposals ({activeProposals.length})
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`px-6 py-3 font-medium transition-colors ${
                selectedTab === 'history'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Voting History ({historyProposals.length})
            </button>
          </div>

          {/* Proposals List */}
          <div className="space-y-4">
            {(selectedTab === 'active' ? activeProposals : historyProposals).map((proposal) => (
              <div key={proposal.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/70 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{proposal.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(proposal.category)}`}>
                        {proposal.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(proposal.status)}
                        <span className="text-sm text-slate-400 capitalize">{proposal.status}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">{proposal.description}</p>
                    
                    {/* Voting Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Voting Progress</span>
                        <span className="text-white">{proposal.totalVotes} votes</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                          style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>For: {proposal.votesFor} ({Math.round((proposal.votesFor / proposal.totalVotes) * 100)}%)</span>
                        <span>Against: {proposal.votesAgainst} ({Math.round((proposal.votesAgainst / proposal.totalVotes) * 100)}%)</span>
                      </div>
                    </div>
                  </div>
                  
                  {proposal.status === 'active' && (
                    <div className="ml-6 space-y-2">
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        Vote For
                      </button>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                        Vote Against
                      </button>
                      <div className="text-xs text-slate-400 text-center">
                        Ends: {new Date(proposal.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(selectedTab === 'active' ? activeProposals : historyProposals).length === 0 && (
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
          )}
        </>
      )}
    </div>
  );
}
