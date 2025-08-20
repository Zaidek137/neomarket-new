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
      title: 'The Scavenjers Collection',
      subtitle: 'Limited Edition Eko Launch',
      description: 'Enter the post-apocalyptic world of Eko. Each Scavenjer is a unique digital collectible with rare traits and abilities. Join the adventure and discover the mysteries of the wasteland.',
      image: 'https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675',
      price: 25,
      totalSupply: 9000,
      minted: 1250
    },
    {
      type: 'collection',
      id: 'hashmasks',
      name: 'Hashmasks',
      creator: '2d2502',
      verified: true,
      stats: {
        floorPrice: '$471.10',
        items: '16,384',
        totalVolume: '$316M',
        listed: '3.6%'
      },
      previewImages: Array.from({ length: 12 }, (_, i) => ({
        id: i,
        url: `https://picsum.photos/200/200?random=${i + 100}`
      }))
    }
  ];

  // Auto-advance slides every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const renderEkoLaunchModal = (slide: EkoLaunchModal) => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start h-80">
      {/* Image - Takes up 2 columns */}
      <div className="relative lg:col-span-2 h-full">
        <div className="h-full rounded-xl overflow-hidden bg-slate-800 border border-slate-600/50">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Overlay badge */}
        <div className="absolute top-3 left-3 bg-cyan-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-white font-medium text-xs">🚀 New Launch</span>
        </div>
      </div>

      {/* Content - Takes up 3 columns */}
      <div className="lg:col-span-3 h-full flex flex-col justify-between py-2">
        {/* Title and Description */}
        <div className="space-y-2">
          <div>
            <h2 className="text-xl font-bold text-white leading-tight">{slide.title}</h2>
            <p className="text-cyan-400 font-medium text-sm">{slide.subtitle}</p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{slide.description}</p>
        </div>

        {/* Stats and Progress */}
        <div className="space-y-3 my-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
              <div className="text-xs text-slate-400">Price</div>
              <div className="text-sm font-bold text-white">${slide.price}</div>
            </div>
            <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
              <div className="text-xs text-slate-400">Supply</div>
              <div className="text-sm font-bold text-white">{slide.totalSupply.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 rounded p-2 border border-slate-600/50 text-center">
              <div className="text-xs text-slate-400">Minted</div>
              <div className="text-sm font-bold text-white">{slide.minted.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span>
              <span className="font-medium">{((slide.minted / slide.totalSupply) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(slide.minted / slide.totalSupply) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={() => setShowCrossmintModal(true)}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1"
          >
            <ShoppingCart size={14} />
            Mint Random Eko
          </button>
          <button 
            onClick={() => navigate('/collection/scavenjers')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 border border-slate-600"
          >
            <Eye size={14} />
            View Collection
          </button>
        </div>
      </div>
    </div>
  );

  const renderCollectionModal = (slide: CollectionModal) => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start h-80">
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
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden border border-slate-700/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-cyan-400 w-6' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <div className="relative p-6">
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