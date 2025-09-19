import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";

const clientApiKey = "ck_production_5pLaG5zFyQ6nW2RuHYgapoJKcG4eV8ac5wHvki3bzyBA4MjBRxFybM2zCcQzyH1LttngQDgdDzTK8d47iwfxYrdSpAEwz9cpnrWuR9FwYxApVg9YMPXgPrTkNv4JWY6BgVtNNRmuM25Rm6R1i4KPL8dkbrv3UGLkpYgx83hp6eLRKw4oSmKfEN7z8tKcbX8k91HKcvpZCBDGcHn7kXpUfDCf";
const COLLECTION_ID = 'bf55192e-339c-40a2-a705-c7456b2f3c71';

interface EkoBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EkoBuyModal({ isOpen, onClose }: EkoBuyModalProps) {
  const account = useActiveAccount();
  const address = account?.address;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-cyan-600/50 rounded-2xl shadow-2xl shadow-cyan-500/20 p-4 sm:p-6 w-full max-w-lg sm:max-w-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Buy an Eko</h2>
            <button
              onClick={onClose}
              className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Collection Preview */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] rounded-lg opacity-75 blur"></div>
              <div className="relative bg-[#111111] rounded-lg p-3 sm:p-4">
                <div className="aspect-[4/3] max-w-48 sm:max-w-xs mx-auto rounded-lg overflow-hidden mb-3">
                  <img
                    src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Layer%202%20(1).png?t=2025-01-24T07%3A52%3A30.526Z"
                    alt="Eko Collection Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">Scavenjer Ekos</h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                  Ekos are digital collectibles designed exclusively for the Scavenjer ecosystem. They can be bought, sold, traded, customized, and used to access locked areas, request drops, or even serve as your personal avatar. Each Eko is randomly generated with unique traits and characteristics, based on the specific collection it belongs to.
                </p>
              </div>
            </div>

            {/* Purchase Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-base sm:text-lg">
                <span className="text-gray-300">Price:</span>
                <span className="text-[#2DD4BF] font-bold">$29.55 USD</span>
              </div>
              
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-400 mb-4">
                  Get a randomized Eko from our collection
                </p>
                
                {address ? (
                  // Wallet is connected - show Crossmint checkout
                  <>
                    <CrossmintProvider apiKey={clientApiKey}>
                      <CrossmintHostedCheckout
                        lineItems={{
                          collectionLocator: `crossmint:${COLLECTION_ID}`,
                          callData: {
                            totalPrice: "111",
                            quantity: 1,
                          },
                        }}
                        payment={{ crypto: { enabled: true }, fiat: { enabled: true } }}
                        className="w-full bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] text-white py-3 px-4 sm:px-6 rounded-lg font-semibold hover:from-[#2DD4BF]/90 hover:to-[#EC4899]/90 transition-all duration-300"
                        recipient={{ walletAddress: address }}
                      />
                    </CrossmintProvider>
                    <div className="text-center text-xs text-gray-500 mt-2">
                      You can purchase with your card or any cryptocurrency. Crossmint will handle the currency conversion for you.
                    </div>
                  </>
                ) : (
                  // Wallet not connected - show connection prompt
                  <div className="space-y-4">
                    <div className="text-xs sm:text-sm text-pink-400 bg-pink-900/20 border border-pink-500/20 rounded-lg px-3 sm:px-4 py-3">
                      Please connect your wallet to purchase an Eko. You can pay with your card or any cryptocurrency once connected.
                    </div>
                    <button 
                      disabled
                      className="w-full bg-gray-600 text-gray-400 py-3 px-4 sm:px-6 rounded-lg font-semibold cursor-not-allowed opacity-50"
                    >
                      Connect Wallet to Purchase
                    </button>
                    <div className="text-center text-xs text-gray-500">
                      Connect your wallet using the button in the top navigation to enable purchasing.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 