import React from 'react';
import { Settings, User, Trophy, Palette, Wrench } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <Settings className="text-cyan-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-white">Settings</h1>
              <p className="text-slate-400">Manage your NeoMarket preferences</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-cyan-500/20">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <Wrench className="text-cyan-400" size={48} />
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="animate-pulse">🚀</span>
              Coming Soon
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold font-tech text-white mb-4">
              Personalized Settings Experience
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Users will be able to create their own profile and design as they want. 
              Leaderboard will be created and much more.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Profile Customization */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <User className="text-purple-400" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Custom Profiles</h3>
                <p className="text-slate-400 text-sm">
                  Design your unique profile with custom avatars, themes, and personal branding
                </p>
              </div>

              {/* Leaderboard */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <Trophy className="text-yellow-400" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Leaderboards</h3>
                <p className="text-slate-400 text-sm">
                  Compete with other Scavenjers and climb the rankings across various metrics
                </p>
              </div>

              {/* Theme Customization */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                    <Palette className="text-cyan-400" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Theme Designer</h3>
                <p className="text-slate-400 text-sm">
                  Customize your NeoMarket experience with personalized themes and layouts
                </p>
              </div>
            </div>

            {/* Current Settings Info */}
            <div className="bg-slate-800/20 rounded-lg p-6 border border-slate-600/30">
              <h3 className="text-lg font-semibold text-white mb-3">For Now</h3>
              <p className="text-slate-300 leading-relaxed">
                Your settings will be handled in the wallet component from your wallet provider. 
                Connect your wallet to access basic account management and preferences.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
