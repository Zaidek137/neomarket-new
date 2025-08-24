
import { Music, Radio, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MusicCard() {

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative rounded-2xl overflow-hidden border border-emerald-500/40 backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-emerald-500/20"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Music%20page/zaidek._Cyberpunk_album_cover_art_featuring_a_mechanical_robo_a89251ff-9058-46a3-aee2-8c5721f420a8_1.png"
          alt="The Lost Signal Album"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-1000/85 via-emerald-900/60 to-slate-900/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-emerald-500/20 backdrop-blur-md p-3 rounded-xl border border-emerald-400/40">
            <Radio className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              The Broadcast
            </h3>
            <p className="text-white/80 text-sm">
              Scavenjer Music
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm leading-relaxed mb-6 flex-1">
          Discover the official Scavenjer soundtrack featuring "The Lost Signal" - the first album release. Experience the cyberpunk atmosphere through music.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Music size={14} className="text-white" />
              <span className="text-xs text-white/70">Album</span>
            </div>
            <div className="text-lg font-bold text-white">The Lost Signal</div>
          </div>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Play size={14} className="text-white" />
              <span className="text-xs text-white/70">Platforms</span>
            </div>
            <div className="text-lg font-bold text-white">Spotify, Apple Music, Youtube</div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => window.open('https://www.scavenjer.com/broadcast', '_blank')}
          className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg group-hover:scale-105"
        >
          <span>Enter The Broadcast</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
