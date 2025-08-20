import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";
import { createThirdwebClient } from 'thirdweb';

const client = createThirdwebClient({
  clientId: "dc56b7276133338ec60eebc93d1c38b1"
});

const clientApiKey = "ck_production_5pLaG5zFyQ6nW2RuHYgapoJKcG4eV8ac5wHvki3bzyBA4MjBRxFybM2zCcQzyH1LttngQDgdDzTK8d47iwfxYrdSpAEwz9cpnrWuR9FwYxApVg9YMPXgPrTkNv4JWY6BgVtNNRmuM25Rm6R1i4KPL8dkbrv3UGLkpYgx83hp6eLRKw4oSmKfEN7z8tKcbX8k91HKcvpZCBDGcHn7kXpUfDCf";
const COLLECTION_ID = 'bf55192e-339c-40a2-a705-c7456b2f3c71';

interface CrossmintCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionTitle: string;
  price: number;
}

export default function CrossmintCheckoutModal({ isOpen, onClose }: CrossmintCheckoutModalProps) {
  const account = useActiveAccount();
  const address = account?.address;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-4 sm:p-6 border-b border-gray-700 bg-gradient-to-r from-[#2DD4BF]/10 to-[#EC4899]/10">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
          
          <div className="pr-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Buy Random Eko
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              From The Scavenjers Collection
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* NFT Preview */}
          <div className="text-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gray-800 border border-gray-600">
              <img
                src="https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675"
                alt="Random Eko Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
              Mystery Eko
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-2">
              Rare traits • Unique abilities
            </p>
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
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-300 text-sm">
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
                      className: "!w-full !bg-gradient-to-r !from-[#2DD4BF] !to-[#EC4899] !text-white !py-3 !px-6 !rounded-lg !font-semibold hover:!from-[#2DD4BF]/90 hover:!to-[#EC4899]/90 !transition-all !duration-300"
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
