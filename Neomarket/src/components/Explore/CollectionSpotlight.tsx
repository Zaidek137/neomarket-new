import React, { useState, useEffect } from 'react';
import { CheckCircle, Heart, Eye, ChevronLeft, ChevronRight, ShoppingCart, ExternalLink, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CrossmintCheckoutModal from '../CrossmintCheckoutModal';

interface EkoLaunchModal {
  type: 'eko-launch';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundImage?: string; // Optional custom background image
  price: number;
  totalSupply: number;
  minted: number;
}

interface CollectionModal {
  type: 'collection';
  id: string;
  name: string;
  creator: string;
  verified: boolean;
  stats: {
    floorPrice: string;
    items: string;
    totalVolume: string;
    listed: string;
  };
  previewImages: { id: number; url: string; }[];
}

type SlideModal = EkoLaunchModal | CollectionModal;

export default function CollectionSpotlight() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCrossmintModal, setShowCrossmintModal] = useState(false);
  const navigate = useNavigate();

  // Define all slides/modals
  const slides: SlideModal[] = [
    {
      type: 'eko-launch',
      id: 'eko-launch',
      title: 'The Scavenjers Intro Collection',
      subtitle: 'Limited Edition Eko Launch',
      description: 'The Scavenjers is an intro collection of unique digital avatars for the Scavenjer ecosystem that are used to participate in the Scavenjer ecosystem by allowing you to vote, claim rewards, compete, and more.',
      image: 'https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675',
      backgroundImage: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Collection%20BG.png', // You can replace this with a custom 2:1 background image
      price: 29.55,
      totalSupply: 9000,
      minted: 1250
    }
  ];



  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const renderEkoLaunchModal = (slide: EkoLaunchModal) => (
    <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
      {/* Background Image with 2:1 aspect ratio */}
      <div className="absolute inset-0">
        <img
          src={slide.backgroundImage || slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Overlays */}
      <div className="absolute inset-0 flex items-center p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 w-full">
          
          {/* Left: Title and Description Box */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 lg:p-4 border border-slate-700/50 w-full lg:max-w-md">
            <h2 className="text-lg lg:text-xl font-bold text-white mb-1">{slide.title}</h2>
            <p className="text-cyan-400 font-medium text-xs lg:text-sm mb-1 lg:mb-2">{slide.subtitle}</p>
            <p className="text-slate-300 text-xs lg:text-sm leading-relaxed line-clamp-2 hidden lg:block">{slide.description}</p>
          </div>

          {/* Center: Stats Boxes */}
          <div className="flex gap-2 lg:gap-3">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-slate-700/50 text-center min-w-[80px] lg:min-w-[100px]">
              <div className="text-[10px] lg:text-xs text-slate-400">Price</div>
              <div className="text-base lg:text-lg font-bold text-white">${slide.price}</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-slate-700/50 text-center min-w-[80px] lg:min-w-[100px]">
              <div className="text-[10px] lg:text-xs text-slate-400">Supply</div>
              <div className="text-base lg:text-lg font-bold text-white">{slide.totalSupply.toLocaleString()}</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 lg:p-3 border border-slate-700/50 text-center min-w-[80px] lg:min-w-[100px]">
              <div className="text-[10px] lg:text-xs text-slate-400">Minted</div>
              <div className="text-base lg:text-lg font-bold text-white">{slide.minted.toLocaleString()}</div>
              <div className="text-[10px] text-cyan-400">{((slide.minted / slide.totalSupply) * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="w-full lg:w-auto lg:ml-auto">
            <button 
              onClick={() => setShowCrossmintModal(true)}
              className="w-full lg:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm lg:text-base"
            >
              <ShoppingCart size={16} className="lg:w-[18px] lg:h-[18px]" />
              Buy with Crossmint
            </button>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white font-medium text-xs">🚀 New Launch</span>
      </div>
    </div>
  );

  const renderCollectionModal = (slide: CollectionModal) => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-h-[320px]">
      {/* Preview Mosaic - Takes up 2 columns */}
      <div className="lg:col-span-2 h-full">
        <div className="grid grid-cols-4 gap-1 h-full">
          {slide.previewImages.slice(0, 8).map((image) => (
            <div
              key={image.id}
              className="aspect-square rounded overflow-hidden bg-slate-800 hover:scale-105 transition-transform duration-200"
            >
              <img
                src={image.url}
                alt={`Preview ${image.id}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Collection Info - Takes up 3 columns */}
      <div className="lg:col-span-3 h-full flex flex-col justify-between py-2">
        {/* Title and Creator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{slide.name}</h2>
            {slide.verified && (
              <CheckCircle size={16} className="text-blue-500" />
            )}
          </div>
          <p className="text-slate-400 text-sm">
            By <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium">{slide.creator}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
            <div className="text-xs text-slate-400">Floor Price</div>
            <div className="text-sm font-bold text-white">{slide.stats.floorPrice}</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
            <div className="text-xs text-slate-400">Items</div>
            <div className="text-sm font-bold text-white">{slide.stats.items}</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
            <div className="text-xs text-slate-400">Volume</div>
            <div className="text-sm font-bold text-white">{slide.stats.totalVolume}</div>
          </div>
          <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
            <div className="text-xs text-slate-400">Listed</div>
            <div className="text-sm font-bold text-white">{slide.stats.listed}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1">
            <Eye size={14} />
            View Collection
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 border border-slate-600">
            <Heart size={14} />
            Watch
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Slide Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {slides[currentSlide].type === 'eko-launch' 
                ? renderEkoLaunchModal(slides[currentSlide] as EkoLaunchModal)
                : renderCollectionModal(slides[currentSlide] as CollectionModal)
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Crossmint Checkout Modal */}
      {showCrossmintModal && (
        <CrossmintCheckoutModal
          isOpen={showCrossmintModal}
          onClose={() => setShowCrossmintModal(false)}
          collectionTitle="The Scavenjers"
          price={25}
        />
      )}
    </>
  );
}