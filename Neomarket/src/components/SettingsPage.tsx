
import { Settings, User, Trophy, Palette, Wrench } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700/50">
              <Settings className="text-cyan-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">Settings</h1>
              <p className="text-sm sm:text-base text-slate-400">Manage your NeoMarket preferences</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-lg sm:rounded-xl p-6 sm:p-8 border border-cyan-500/20">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                <Wrench className="text-cyan-400 w-8 h-8 sm:w-12 sm:h-12" />
              </div>
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <span className="animate-pulse">🚀</span>
              Coming Soon
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold font-tech text-white mb-3 sm:mb-4">
              Personalized Settings Experience
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
              Users will be able to create their own profile and design as they want. 
              Leaderboard will be created and much more.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Profile Customization */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-700/50">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-2.5 sm:p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <User className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Custom Profiles</h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Design your unique profile with custom avatars, themes, and personal branding
                </p>
              </div>

              {/* Leaderboard */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-700/50">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-2.5 sm:p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <Trophy className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Leaderboards</h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Compete with other Scavenjers and climb the rankings across various metrics
                </p>
              </div>

              {/* Theme Customization */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-slate-700/50 sm:col-span-2 md:col-span-1">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-2.5 sm:p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                    <Palette className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Theme Designer</h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Customize your NeoMarket experience with personalized themes and layouts
                </p>
              </div>
            </div>

            {/* Current Settings Info */}
            <div className="bg-slate-800/20 rounded-lg p-4 sm:p-6 border border-slate-600/30">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">For Now</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
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
