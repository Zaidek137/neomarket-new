import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trophy, Vote, Zap, Eye, Plus, Minus } from 'lucide-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";
import { createThirdwebClient } from 'thirdweb';
import { useNavigate } from 'react-router-dom';

const client = createThirdwebClient({
  clientId: "dc56b7276133338ec60eebc93d1c38b1"
});

const clientApiKey = "ck_production_5pLaG5zFyQ6nW2RuHYgapoJKcG4eV8ac5wHvki3bzyBA4MjBRxFybM2zCcQzyH1LttngQDgdDzTK8d47iwfxYrdSpAEwz9cpnrWuR9FwYxApVg9YMPXgPrTkNv4JWY6BgVtNNRmuM25Rm6R1i4KPL8dkbrv3UGLkpYgx83hp6eLRKw4oSmKfEN7z8tKcbX8k91HKcvpZCBDGcHn7kXpUfDCf";
const COLLECTION_ID = 'bf55192e-339c-40a2-a705-c7456b2f3c71';

interface IntroEkoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IntroEkoModal({ isOpen, onClose }: IntroEkoModalProps) {
  const account = useActiveAccount();
  const address = account?.address;
  const navigate = useNavigate();
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  // Purchase quantity handlers
  const incrementQuantity = useCallback(() => {
    setPurchaseQuantity(prev => Math.min(prev + 1, 10));
  }, []);

  const decrementQuantity = useCallback(() => {
    setPurchaseQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border-2 border-yellow-500/60 shadow-2xl shadow-yellow-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-all duration-200 border border-slate-600/50"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Header Section */}
              <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                {/* Welcome Badge */}
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">
                  <span className="animate-pulse">🎉</span>
                  Welcome to NeoMarket
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white mb-2 sm:mb-3">
                  Intro Eko Collection
                </h1>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold font-tech bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-4">
                  The Scavenjers
                </h2>
                
                {/* Description */}
                <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8"> 
                  Your journey starts here with our massive 9,000 Eko collection. Each Eko is unique with randomized traits and abilities.
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Left: Collection Info */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Collection Image */}
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg sm:rounded-xl overflow-hidden border border-slate-700/50">
                      <img
                        src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Main%20Scavenjer.png"
                        alt="The Scavenjers Collection"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Price Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 lg:top-4 lg:left-4 bg-yellow-500/90 backdrop-blur-sm text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm border border-yellow-400">
                      ~$19 USD
                      <div className="text-[9px] font-normal">Est. Price</div>
                    </div>
                  </div>

                  {/* View Collection Button */}
                  <button 
                    onClick={() => {
                      navigate('/collection/scavenjers');
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                  >
                    <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                    View Collection
                  </button>
                </div>

                {/* Right: Community Features */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {/* Community-First Section */}
                  <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-cyan-500/20">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-1.5 sm:p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                        <Users className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold font-tech text-white">Community‑first</h3>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 text-slate-300">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Vote className="text-cyan-400 mt-0.5 sm:mt-1 w-4 h-4" />
                        <p className="text-xs sm:text-sm leading-relaxed">
                          We're building with-and-for our Scavenjers. Make your votes visible and let's celebrate big wins together.
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Trophy className="text-yellow-400 mt-0.5 sm:mt-1 w-4 h-4" />
                        <p className="text-xs sm:text-sm leading-relaxed">
                          Use your Eko to compete in our augmented environment for real rewards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                    <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/50 text-center">
                      <div className="flex justify-center mb-1 sm:mb-2">
                        <Vote className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white">Governance</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">Vote on proposals</div>
                    </div>
                    
                    <div className="bg-slate-800/30 rounded-lg p-3 sm:p-4 border border-slate-700/50 text-center">
                      <div className="flex justify-center mb-1 sm:mb-2">
                        <Zap className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-white">Compete</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">Earn rewards</div>
                    </div>
                  </div>

                  {/* Purchase Section */}
                  <div className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-500/30">
                    <h4 className="text-base sm:text-lg font-bold font-tech text-white mb-2 sm:mb-3 text-center">Get Your Eko{purchaseQuantity > 1 ? 's' : ''} Now</h4>
                    <p className="text-slate-300 text-xs sm:text-sm text-center mb-3 sm:mb-4">
                      Purchase with crypto or card. Get {purchaseQuantity > 1 ? `${purchaseQuantity} randomized Ekos` : 'a randomized Eko'} from 9,000 unique collectibles.
                    </p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <span className="text-slate-300 text-sm">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={decrementQuantity}
                          disabled={purchaseQuantity <= 1}
                          className="w-8 h-8 rounded bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-slate-600/50"
                        >
                          <Minus size={14} className="text-white" />
                        </button>
                        <div className="w-12 text-center">
                          <span className="text-lg font-bold text-white">{purchaseQuantity}</span>
                        </div>
                        <button
                          onClick={incrementQuantity}
                          disabled={purchaseQuantity >= 10}
                          className="w-8 h-8 rounded bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-slate-600/50"
                        >
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="text-center mb-4">
                      <div className="text-yellow-400 font-bold text-lg">
                        Current Est. Price: ${(19 * purchaseQuantity).toFixed(0)} USD
                      </div>
                      <div className="text-xs text-slate-400">
                        Pricing fluctuates based on Polygon network
                      </div>
                    </div>
                    
                    {address ? (
                      // Wallet is connected - show Crossmint checkout
                      <>
                        <CrossmintProvider apiKey={clientApiKey}>
                          <CrossmintHostedCheckout
                            lineItems={{
                              collectionLocator: `crossmint:${COLLECTION_ID}`,
                              callData: {
                                totalPrice: (74 * purchaseQuantity).toString(),
                                quantity: purchaseQuantity,
                              },
                            }}
                            payment={{ crypto: { enabled: true }, fiat: { enabled: true } }}
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                            recipient={{ walletAddress: address }}
                          />
                        </CrossmintProvider>
                        <div className="text-center text-xs text-slate-500 mt-3">
                          Powered by Crossmint • Secure checkout
                        </div>
                      </>
                    ) : (
                      // Wallet not connected - show connection prompt
                      <div className="space-y-4">
                        <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-3">
                          <p className="text-yellow-300 text-sm text-center">
                            Please connect your wallet to purchase with Crossmint
                          </p>
                        </div>
                        <ConnectButton
                          client={client}
                          appMetadata={{
                            name: "NeoMarket",
                            url: "https://neomarket.scavenjer.com"
                          }}
                          connectModal={{
                            size: "wide",
                            titleIcon: "https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Neomarket%20Log.png"
                          }}
                          theme="dark"
                          connectButton={{
                            label: "Connect Wallet to Purchase",
                            className: "!w-full !bg-gradient-to-r !from-yellow-500 !to-yellow-600 hover:!from-yellow-600 hover:!to-yellow-700 !text-black !py-3 !px-6 !rounded-lg !font-bold !transition-all !duration-200"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
