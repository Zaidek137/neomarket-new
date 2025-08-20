
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CubeIcon, FireIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Discover, Collect, and Sell
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold mb-8 text-slate-300"
          >
            Extraordinary NFTs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto"
          >
            NeoMarket is the world's leading NFT marketplace. Discover, collect, and sell rare digital assets from the world's top creators.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/explore"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Explore NFTs</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/create"
              className="px-8 py-4 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all duration-300"
            >
              Create NFT
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.05 }}
                className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <CubeIcon className="w-16 h-16 text-slate-400" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Collection {item}</h3>
                  <p className="text-slate-400 mb-4">Amazing digital art collection featuring unique NFTs.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Floor: 0.5 ETH</span>
                    <Link
                      to={`/collection/${item}`}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View Collection
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <FireIcon className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-3xl font-bold mb-2">1M+</h3>
              <p className="text-slate-400">NFTs Sold</p>
            </div>
            <div className="flex flex-col items-center">
              <ChartBarIcon className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-3xl font-bold mb-2">$500M+</h3>
              <p className="text-slate-400">Volume Traded</p>
            </div>
            <div className="flex flex-col items-center">
              <CubeIcon className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-3xl font-bold mb-2">100K+</h3>
              <p className="text-slate-400">Active Users</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
