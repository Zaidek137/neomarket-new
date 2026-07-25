import React, { useState, useEffect } from 'react';
import { X, Eye, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { rewardsService } from '../../services/rewardsService';

interface ExchangeLog {
  id: string;
  user_wallet_address: string;
  collection_address: string;
  token_id: string;
  usdt_amount: number | null;
  reward_type: string;
  custom_reward_data: any | null;
  user_info: any | null;
  transfer_transaction_hash: string | null;
  status: 'pending_usdt' | 'processed' | 'cancelled';
  created_at: string;
  processed_by_admin_wallet?: string | null;
  usdt_transaction_hash?: string | null;
}

interface AdminExchangeLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: any;
}

export function AdminExchangeLogsModal({ isOpen, onClose, account }: AdminExchangeLogsModalProps) {
  const [exchanges, setExchanges] = useState<ExchangeLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPendingExchanges();
    }
  }, [isOpen]);

  const fetchPendingExchanges = async () => {
    setLoading(true);
    try {
      const data = await rewardsService.getPendingExchanges(account);
      setExchanges(data);
    } catch (error) {
      console.error('Error fetching pending exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (exchangeId: string, usdtTxHash?: string) => {
    try {
      await rewardsService.markExchangeProcessed(
        exchangeId,
        account?.address || '',
        usdtTxHash,
        account
      );
      
      // Refresh the list
      await fetchPendingExchanges();
      alert('Exchange marked as processed successfully!');
    } catch (error) {
      console.error('Error marking exchange as processed:', error);
      alert('Failed to mark exchange as processed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_usdt': return 'text-yellow-400 bg-yellow-400/10';
      case 'processed': return 'text-green-400 bg-green-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Exchange Logs</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-slate-400">Loading exchange logs...</p>
            </div>
          ) : exchanges.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={48} className="text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No pending exchanges</h3>
              <p className="text-slate-400">All exchanges have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* User and Token Info */}
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-white font-medium">
                            User: {shortenAddress(exchange.user_wallet_address)}
                          </p>
                          <p className="text-slate-400 text-sm">
                            Token #{exchange.token_id} from {shortenAddress(exchange.collection_address)}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exchange.status)}`}>
                          {exchange.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>

                      {/* Reward Info */}
                      <div className="flex items-center gap-6">
                        {exchange.reward_type === 'usdt' && exchange.usdt_amount && (
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold">
                              ${exchange.usdt_amount} USDT
                            </span>
                          </div>
                        )}
                        
                        {exchange.custom_reward_data && (
                          <div className="text-orange-400">
                            Custom Reward: {exchange.custom_reward_data.title}
                          </div>
                        )}
                        
                        <div className="text-slate-400 text-sm">
                          {formatDate(exchange.created_at)}
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      {exchange.transfer_transaction_hash && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400">NFT Transfer:</span>
                          <a
                            href={`https://polygonscan.com/tx/${exchange.transfer_transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                          >
                            {shortenAddress(exchange.transfer_transaction_hash)}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedExchange(exchange);
                          setShowDetails(true);
                        }}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      
                      {exchange.status === 'pending_usdt' && (
                        <button
                          onClick={() => {
                            const usdtTxHash = prompt('Enter USDT transaction hash (optional):');
                            markAsProcessed(exchange.id, usdtTxHash || undefined);
                          }}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedExchange && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Exchange Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-white font-medium mb-2">Transaction Info</h4>
                <div className="bg-slate-700/30 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exchange ID:</span>
                    <span className="text-white font-mono">{selectedExchange.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">User Wallet:</span>
                    <span className="text-white font-mono">{selectedExchange.user_wallet_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Collection:</span>
                    <span className="text-white font-mono">{selectedExchange.collection_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Token ID:</span>
                    <span className="text-white">{selectedExchange.token_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-white">{formatDate(selectedExchange.created_at)}</span>
                  </div>
                </div>
              </div>

              {selectedExchange.user_info && (
                <div>
                  <h4 className="text-white font-medium mb-2">User Contact Info</h4>
                  <div className="bg-slate-700/30 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white">{selectedExchange.user_info.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white">{selectedExchange.user_info.email}</span>
                    </div>
                    {selectedExchange.user_info.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone:</span>
                        <span className="text-white">{selectedExchange.user_info.phone}</span>
                      </div>
                    )}
                    {selectedExchange.user_info.address && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Address:</span>
                        <span className="text-white">{selectedExchange.user_info.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedExchange.custom_reward_data && (
                <div>
                  <h4 className="text-white font-medium mb-2">Custom Reward</h4>
                  <div className="bg-slate-700/30 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Title:</span>
                      <span className="text-white">{selectedExchange.custom_reward_data.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Description:</span>
                      <span className="text-white">{selectedExchange.custom_reward_data.description}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
