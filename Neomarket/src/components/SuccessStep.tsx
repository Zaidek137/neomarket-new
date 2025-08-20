import React from 'react';
import { CheckCircle, ExternalLink, Share2 } from 'lucide-react';

interface SuccessStepProps {
  transactionHash?: string;
  tokenId?: string;
  collectionName?: string;
  onClose: () => void;
}

export default function SuccessStep({ 
  transactionHash, 
  tokenId, 
  collectionName = "NFT",
  onClose 
}: SuccessStepProps) {
  const polygonScanUrl = transactionHash 
    ? `https://polygonscan.com/tx/${transactionHash}`
    : null;

  return (
    <div className="text-center space-y-6 p-6">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-400" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h2>
        <p className="text-slate-300">
          Congratulations! You've successfully purchased {collectionName}
          {tokenId && ` #${tokenId}`}.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
        {transactionHash && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Transaction Hash:</span>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-sm">
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
              </span>
              {polygonScanUrl && (
                <a
                  href={polygonScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
        {tokenId && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Token ID:</span>
            <span className="text-white font-medium">#{tokenId}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
        >
          View My Collection
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'I just bought an NFT!',
                text: `Check out my new ${collectionName} NFT!`,
                url: window.location.href
              });
            }
          }}
          className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
