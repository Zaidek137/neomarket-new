import React from 'react';
import { polygon } from 'thirdweb/chains';

const SuccessStep = ({
  txHash,
  metadata,
  onClose,
}: {
  txHash: string;
  metadata: { name?: string; description?: string; image?: string };
  onClose: () => void;
}) => {
  const explorerUrl = `${polygon.blockExplorers?.[0]?.url}/tx/${txHash}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "I just bought a new Eko!",
        text: `Check out my new ${metadata.name || 'Eko'} on the Scavenger Marketplace!`,
        url: window.location.href, // Or a direct link to the item if available
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="text-center space-y-5">
      <div className="text-6xl">🎉</div>
      <div>
        <h3 className="text-2xl font-bold text-green-400">
          Purchase Successful!
        </h3>
        <p className="text-gray-400 mt-2">
          Congratulations! Your new Eko is now in your wallet.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
        <p className="font-semibold text-white">{metadata.name}</p>
        <p className="text-sm text-gray-400">
          {metadata.description}
        </p>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-cyan-400 hover:underline text-sm"
        >
          View on Polygonscan
        </a>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onClose}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Purchase Another Eko
        </button>
        <button
          onClick={handleShare}
          className="w-full border border-gray-600 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default SuccessStep; 