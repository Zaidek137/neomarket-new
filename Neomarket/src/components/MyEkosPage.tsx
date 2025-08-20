import React, { useState, useEffect } from 'react';
import { User, Plus, ShoppingCart, Eye, ExternalLink, Wallet } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS } from '../config/constants';

const client = createThirdwebClient({
  clientId: "dc56b7276133338ec60eebc93d1c38b1"
});

interface OwnedEko {
  tokenId: string;
  name: string;
  image: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default function MyEkosPage() {
  const account = useActiveAccount();
  const [ownedEkos, setOwnedEkos] = useState<OwnedEko[]>([]);
  const [loading, setLoading] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedEko, setSelectedEko] = useState<OwnedEko | null>(null);
  const [listingPrice, setListingPrice] = useState('');

  // Fetch user's owned Ekos
  useEffect(() => {
    if (account?.address) {
      fetchOwnedEkos();
    } else {
      setOwnedEkos([]);
    }
  }, [account?.address]);

  const fetchOwnedEkos = async () => {
    if (!account?.address) return;

    setLoading(true);
    try {
      console.log('Fetching owned NFTs for:', account.address);
      
      // For now, simulate API call and show no NFTs found
      // This will be replaced with real Thirdweb integration once we resolve the import issues
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOwnedEkos([]);
      console.log('No NFTs found for this wallet');
      
    } catch (error) {
      console.error('Error fetching owned Ekos:', error);
      setOwnedEkos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleListEko = (eko: OwnedEko) => {
    setSelectedEko(eko);
    setShowListModal(true);
  };

  const ListEkoModal = () => {
    if (!selectedEko) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">List Eko for Sale</h3>
            <button
              onClick={() => setShowListModal(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Eko Preview */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                  {selectedEko.image ? (
                    <img 
                      src={selectedEko.image} 
                      alt={selectedEko.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <User size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white">{selectedEko.name}</h4>
                  <p className="text-sm text-slate-400">Token ID: {selectedEko.tokenId}</p>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Listing Price (MATIC)
              </label>
              <input
                type="number"
                step="0.001"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                placeholder="0.1"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <p className="text-xs text-slate-400">
                Set your desired price in MATIC tokens
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowListModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-600"
              >
                Cancel
              </button>
              <button
                disabled={!listingPrice || parseFloat(listingPrice) <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                List for Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EkoCard = ({ eko }: { eko: OwnedEko }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800/70 transition-colors">
      {/* Image */}
      <div className="aspect-square bg-slate-700 relative">
        {eko.image ? (
          <img 
            src={eko.image} 
            alt={eko.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <User size={48} />
          </div>
        )}
        
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => handleListEko(eko)}
            className="p-2 bg-cyan-500/80 backdrop-blur-sm rounded-lg hover:bg-cyan-600/80 transition-colors"
            title="List for Sale"
          >
            <ShoppingCart size={16} className="text-white" />
          </button>
          <button
            className="p-2 bg-slate-600/80 backdrop-blur-sm rounded-lg hover:bg-slate-700/80 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-medium text-white text-sm truncate">{eko.name}</h3>
          <p className="text-xs text-slate-400">Token ID: {eko.tokenId}</p>
        </div>

        {/* Traits Preview */}
        {eko.attributes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {eko.attributes.slice(0, 2).map((attr, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded border border-slate-600/50 truncate"
              >
                {attr.value}
              </span>
            ))}
            {eko.attributes.length > 2 && (
              <span className="px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded border border-slate-600/50">
                +{eko.attributes.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="text-cyan-400" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">My Ekos</h1>
            <p className="text-slate-400">Manage your Eko collection</p>
          </div>
        </div>
        
        {account && ownedEkos.length > 0 && (
          <button
            onClick={() => window.open('/exchange', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            <ExternalLink size={16} />
            View Exchange
          </button>
        )}
      </div>

      {/* Wallet Connection Check */}
      {!account ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <div className="space-y-4">
            <Wallet className="text-slate-400 mx-auto" size={64} />
            <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Connect your wallet to view and manage your Eko collection. You'll be able to see all your owned Ekos and list them for sale.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <User className="text-cyan-400" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{ownedEkos.length}</div>
                  <div className="text-sm text-slate-400">Owned Ekos</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <ShoppingCart className="text-purple-400" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-sm text-slate-400">Listed for Sale</div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Plus className="text-green-400" size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-sm text-slate-400">Total Sales</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading your Ekos...</p>
            </div>
          )}

          {/* Ekos Grid */}
          {!loading && ownedEkos.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Your Collection</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {ownedEkos.map((eko) => (
                  <EkoCard key={eko.tokenId} eko={eko} />
                ))}
              </div>
            </div>
          )}

          {/* No Ekos State */}
          {!loading && ownedEkos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-xl font-bold text-white mb-2">No Ekos Found</h3>
              <p className="text-slate-400 mb-6">
                You don't own any Ekos yet. Purchase one from our collection to get started!
              </p>
              <button
                onClick={() => window.open('/collection/scavenjers', '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <ShoppingCart size={16} />
                Browse Collection
              </button>
            </div>
          )}
        </>
      )}

      {/* List Eko Modal */}
      {showListModal && <ListEkoModal />}
    </div>
  );
}
