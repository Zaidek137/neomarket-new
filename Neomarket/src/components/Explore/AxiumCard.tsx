import { useNavigate } from 'react-router-dom';
import { Coins, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AxiumCard() {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative rounded-2xl overflow-hidden border border-amber-500/40 backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-amber-500/20"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Axium%20logo.jpeg"
          alt="Scavenjer Logo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-amber-950/70 to-slate-00/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-amber-500/20 backdrop-blur-md p-3 rounded-xl border border-amber-400/40">
            <Coins className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              Axium Token
            </h3>
            <p className="text-white/80 text-sm">
              Founders Sale Active
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm leading-relaxed mb-6 flex-1">
          The native utility token of the Scavenjer ecosystem. Exclusive founders sale now active for Eko NFT holders only.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-white" />
              <span className="text-xs text-white/70">Status</span>
            </div>
            <div className="text-lg font-bold text-white">Stage 1</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={14} className="text-white" />
              <span className="text-xs text-white/70">Access</span>
            </div>
            <div className="text-lg font-bold text-white">Eko Holders</div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => window.open('https://www.scavenjer.com/token', '_blank')}
          className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg group-hover:scale-105"
        >
          <span>Learn More</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
