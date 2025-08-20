
import { useParams } from 'react-router-dom';

export default function AssetPage() {
  const { contractAddress, tokenId } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* NFT Image */}
          <div className="bg-slate-900 rounded-lg p-8">
            <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <div className="text-6xl">🎨</div>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">NFT #{tokenId}</h1>
              <p className="text-slate-400">From Collection</p>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Current Price</h3>
              <div className="text-2xl font-bold mb-4">1.5 ETH</div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                Buy Now
              </button>
            </div>

            <div className="bg-slate-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contract Address:</span>
                  <span className="font-mono">{contractAddress?.slice(0, 6)}...{contractAddress?.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Token ID:</span>
                  <span>{tokenId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Token Standard:</span>
                  <span>ERC-721</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blockchain:</span>
                  <span>Ethereum</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
