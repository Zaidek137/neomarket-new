import { motion } from 'framer-motion';
import { 
  Coins, 
  TrendingUp, 
  Lock, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function AxiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="text-amber-400" size={32} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Axium Token
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            The native utility token powering the Scavenjer ecosystem. Earn, trade, and unlock exclusive features with Axium.
          </p>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-900/30 via-yellow-900/20 to-orange-900/30 rounded-2xl border border-amber-500/30 p-8 mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Founders Sale - Exclusive Access
              </h2>
              <p className="text-slate-300 mb-6">
                n is currently in its founders sale phase, exclusively available to Eko NFT holders. 
                This is your opportunity to get early access to the ecosystem's native currency before public launch.
              </p>
              <div className="flex items-center gap-2 text-amber-300 mb-4">
                <Lock size={20} />
                <span className="font-medium">Eko Holders Only</span>
              </div>
              <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2">
                <span>Join Founders Sale</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20 relative">
              {/* Token Logo */}
              <div className="absolute top-4 right-4 w-12 h-12 opacity-30">
                <img 
                  src="https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675"
                  alt="Axium Token"
                  className="w-full h-full object-contain filter brightness-0 invert sepia saturate-200 hue-rotate-45"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Token Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-amber-300 font-medium">Stage 1 Sale</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Access</span>
                  <span className="text-white">Eko NFT Holders</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network</span>
                  <span className="text-white">Polygon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white">Utility Token</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-amber-400" size={24} />
              <h3 className="text-lg font-bold text-white">Ecosystem Rewards</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Earn Axium tokens through ecosystem participation, voting, and community engagement.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-emerald-400" size={24} />
              <h3 className="text-lg font-bold text-white">Governance Rights</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Use Axium tokens to participate in governance decisions and shape the future of Scavenjer.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-purple-400" size={24} />
              <h3 className="text-lg font-bold text-white">Exclusive Access</h3>
            </div>
            <p className="text-slate-300 text-sm">
              Unlock premium features, exclusive content, and early access to new ecosystem developments.
            </p>
          </div>
        </motion.div>

        {/* Roadmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Axium Roadmap</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-500 rounded-full p-2 flex-shrink-0">
                <CheckCircle size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Phase 1: Founders Sale</h3>
                <p className="text-slate-300 text-sm">
                  Exclusive pre-sale for Eko NFT holders. Limited supply available at founders pricing.
                </p>
                <span className="text-amber-400 text-xs font-medium">CURRENT PHASE</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-slate-600 rounded-full p-2 flex-shrink-0">
                <Users size={16} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Phase 2: Public Launch</h3>
                <p className="text-slate-300 text-sm">
                  Public token launch with DEX listings and broader ecosystem integration.
                </p>
                <span className="text-slate-400 text-xs font-medium">COMING SOON</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-slate-600 rounded-full p-2 flex-shrink-0">
                <Zap size={16} className="text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Phase 3: Utility Expansion</h3>
                <p className="text-slate-300 text-sm">
                  Full ecosystem integration with staking, rewards, and advanced governance features.
                </p>
                <span className="text-slate-400 text-xs font-medium">FUTURE</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
