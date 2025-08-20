import React from 'react';
import { Zap, Globe, Shield, Rocket } from 'lucide-react';

export default function NeoMarketPage() {
  const features = [
    {
      icon: <Zap className="text-cyan-400" size={24} />,
      title: 'Lightning Fast',
      description: 'Built on Polygon for instant transactions and low fees'
    },
    {
      icon: <Shield className="text-cyan-400" size={24} />,
      title: 'Secure Trading',
      description: 'Advanced security measures protect your digital assets'
    },
    {
      icon: <Globe className="text-cyan-400" size={24} />,
      title: 'Global Access',
      description: 'Trade with collectors worldwide in our decentralized marketplace'
    },
    {
      icon: <Rocket className="text-cyan-400" size={24} />,
      title: 'Cutting Edge',
      description: 'Experience the future of digital collectibles and NFT trading'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NeoMarket</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Your gateway to exclusive Eko collections and digital collectibles. 
          Discover, trade, and collect unique NFTs in the post-apocalyptic world of Scavenjers.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200">
            Start Exploring
          </button>
          <button className="border border-slate-600 hover:border-slate-500 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
            Learn More
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-300 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-cyan-400">1,250+</div>
            <div className="text-slate-300">Ekos Minted</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">500+</div>
            <div className="text-slate-300">Active Traders</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">50+</div>
            <div className="text-slate-300">MATIC Volume</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Enter the Wasteland?</h2>
        <p className="text-slate-300">
          Join thousands of collectors in the most immersive NFT marketplace experience.
        </p>
        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200">
          Get Started Today
        </button>
      </div>
    </div>
  );
}
