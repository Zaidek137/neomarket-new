
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CollectionPage() {
  const { address } = useParams();

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Collection Header */}
        <div className="bg-slate-900 rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Collection {address}</h1>
              <p className="text-slate-400 mb-4">A unique collection of digital artworks.</p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-slate-400">Items:</span>
                  <span className="text-white ml-2">1,000</span>
                </div>
                <div>
                  <span className="text-slate-400">Owners:</span>
                  <span className="text-white ml-2">523</span>
                </div>
                <div>
                  <span className="text-slate-400">Floor Price:</span>
                  <span className="text-white ml-2">0.5 ETH</span>
                </div>
                <div>
                  <span className="text-slate-400">Volume:</span>
                  <span className="text-white ml-2">1,234 ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="text-4xl">🎨</div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">Item #{i + 1}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{(Math.random() * 2 + 0.1).toFixed(2)} ETH</span>
                  <span className="text-slate-400 text-sm">Rank #{i + 1}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
