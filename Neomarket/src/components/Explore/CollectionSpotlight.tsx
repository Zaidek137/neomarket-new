import { useState, useCallback } from 'react';
import { CheckCircle, Heart, Eye, ShoppingCart, Plus, Minus } from 'lucide-react';
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
  const [currentSlide] = useState(0);
  const [showCrossmintModal, setShowCrossmintModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const navigate = useNavigate();

  // Purchase quantity handlers
  const incrementQuantity = useCallback(() => {
    setPurchaseQuantity(prev => Math.min(prev + 1, 10));
  }, []);

  const decrementQuantity = useCallback(() => {
    setPurchaseQuantity(prev => Math.max(prev - 1, 1));
  }, []);

  const handlePurchase = useCallback(() => {
    setShowCrossmintModal(true);
  }, []);

  // Define all slides/modals
  const slides: SlideModal[] = [
    {
      type: 'eko-launch',
      id: 'eko-launch',
      title: 'The Scavenjers Intro Collection',
      subtitle: 'Limited Edition Eko Launch',
      description: 'The Scavenjers is an intro collection of unique digital avatars for the Scavenjer ecosystem that are used to participate in the Scavenjer ecosystem by allowing you to vote, claim rewards, compete, and more.',
      image: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Main%20Scavenjer.png',
      backgroundImage: 'https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Collection%20BG.png', // You can replace this with a custom 2:1 background image
      price: 19,
      totalSupply: 9000
    }
  ];





  const renderEkoLaunchModal = (slide: EkoLaunchModal) => (
    <div className="relative h-[280px] sm:h-[240px] lg:h-[320px] w-full overflow-hidden rounded-xl">
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
      <div className="absolute inset-0 flex items-start sm:items-center pt-4 pb-16 sm:pb-4 px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 w-full min-w-0">
          
          {/* Left: Title and Description Box */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 lg:p-4 border border-slate-50/50 w-full sm:w-auto sm:flex-shrink-0 sm:max-w-xs lg:max-w-md">
            <h2 className="text-sm sm:text-base lg:text-xl font-bold text-white mb-0.5 sm:mb-1">{slide.title}</h2>
            <p className="text-cyan-400 font-medium text-[10px] sm:text-xs lg:text-sm mb-0.5 sm:mb-1 lg:mb-2">{slide.subtitle}</p>
            <p className="text-slate-300 text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-2 hidden sm:block">{slide.description}</p>
          </div>

          {/* Center: Stats */}
          <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 lg:p-3 border border-slate-400/50 text-center min-w-[50px] sm:min-w-[70px] lg:min-w-[80px]">
              <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-400">Est. Price</div>
              <div className="text-xs sm:text-sm lg:text-base font-bold text-white">${slide.price}</div>
              <div className="text-[8px] sm:text-[9px] text-slate-500">~Polygon</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 lg:p-3 border border-slate-400/50 text-center min-w-[50px] sm:min-w-[70px] lg:min-w-[80px]">
              <div className="text-[9px] sm:text-[10px] lg:text-xs text-slate-400">Supply</div>
              <div className="text-xs sm:text-sm lg:text-base font-bold text-white">{slide.totalSupply.toLocaleString()}</div>
            </div>
          </div>

          {/* Spacer to push buy component right */}
          <div className="hidden sm:block flex-grow min-w-[20px]"></div>

          {/* Comprehensive Buy Component - Desktop Only */}
          <div className="hidden sm:block flex-shrink-0">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-400/50 min-w-[360px] lg:min-w-[400px]">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm lg:text-base font-bold text-white">Get Your Eko{purchaseQuantity > 1 ? 's' : ''}</div>
                  <div className="text-xs text-slate-400">Randomized from 9,000 unique collectibles</div>
                </div>
                <div className="text-right">
                  <div className="text-sm lg:text-base font-bold text-cyan-400">${(19 * purchaseQuantity).toFixed(0)} USD</div>
                  <div className="text-xs text-slate-500">Est. Total</div>
                </div>
              </div>

              {/* Quantity & Buy Row */}
              <div className="flex items-center gap-4">
                
                {/* Quantity Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-300">Quantity:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={decrementQuantity}
                      disabled={purchaseQuantity <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-slate-600/50"
                    >
                      <Minus size={12} className="text-white" />
                    </button>
                    <div className="w-8 text-center">
                      <span className="text-lg font-bold text-white">{purchaseQuantity}</span>
                    </div>
                    <button
                      onClick={incrementQuantity}
                      disabled={purchaseQuantity >= 10}
                      className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors border border-slate-600/50"
                    >
                      <Plus size={12} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Buy Button */}
                <div className="flex-1">
                  <button 
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-4 py-2.5 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-sm"
                  >
                    <ShoppingCart size={14} />
                    Buy with Crossmint
                  </button>
                </div>

              </div>

              {/* Footer Info */}
              <div className="mt-3 pt-2 border-t border-slate-600/30 flex justify-between text-xs text-slate-500">
                <span>Max 10 Ekos</span>
                <span>Pricing fluctuates with Polygon</span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 bg-cyan-500/90 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
        <span className="text-white font-medium text-[10px] sm:text-xs">🚀 New Launch</span>
      </div>

      {/* Mobile Controls - Positioned at bottom */}
      <div className="sm:hidden absolute bottom-3 left-3 right-3">
        {/* Mobile Quantity Selector */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-white text-xs">Quantity:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={decrementQuantity}
              disabled={purchaseQuantity <= 1}
              className="w-7 h-7 rounded bg-slate-700/80 hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Minus size={12} className="text-white" />
            </button>
            <span className="text-white font-bold w-6 text-center">{purchaseQuantity}</span>
            <button
              onClick={incrementQuantity}
              disabled={purchaseQuantity >= 10}
              className="w-7 h-7 rounded bg-slate-700/80 hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Plus size={12} className="text-white" />
            </button>
          </div>
        </div>
        {/* Mobile Buy Button */}
        <button 
          onClick={handlePurchase}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg text-xs"
        >
          <ShoppingCart size={14} />
          Buy {purchaseQuantity} Eko{purchaseQuantity > 1 ? 's' : ''}
        </button>
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
            <div className="text-xs text-slate-400">Average Price</div>
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
          <button 
            onClick={() => navigate('/collection/scavenjers')}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
          >
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
          price={19 * purchaseQuantity}
          quantity={purchaseQuantity}
        />
      )}
    </>
  );
}