import React, { useState, useEffect } from 'react';
import { X, CreditCard, Shield, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CrossmintCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionTitle: string;
  price: number;
}

type CheckoutStep = 'payment' | 'processing' | 'success' | 'error';

export default function CrossmintCheckoutModal({ 
  isOpen, 
  onClose, 
  collectionTitle, 
  price 
}: CrossmintCheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('payment');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('payment');
      setEmail('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setStep('processing');
    
    try {
      // Simulate Crossmint API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo purposes, we'll show success
      // In a real implementation, you would integrate with Crossmint SDK
      setStep('success');
    } catch (error) {
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Purchase Random Eko</h3>
        <p className="text-slate-400">From {collectionTitle}</p>
        <div className="text-3xl font-bold text-cyan-400">${price} USD</div>
      </div>

      {/* Features */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="text-green-500" size={20} />
            <span className="text-white">Secure payment powered by Crossmint</span>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-500" size={20} />
            <span className="text-white">Pay with credit card or crypto</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-500" size={20} />
            <span className="text-white">Instant delivery to your wallet</span>
          </div>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <p className="text-xs text-slate-400">
          We'll send your NFT details and receipt to this email
        </p>
      </div>

      {/* Purchase Button */}
      <button
        onClick={handlePurchase}
        disabled={!email || isLoading}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-lg font-medium text-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <CreditCard size={20} />
        {isLoading ? 'Processing...' : `Purchase for $${price}`}
      </button>

      {/* Powered by Crossmint */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          Powered by <span className="text-cyan-400">Crossmint</span> - Enterprise-grade payments
        </p>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Processing Your Purchase</h3>
        <p className="text-slate-400">Please wait while we mint your random Eko...</p>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
        <div className="text-sm text-slate-400 space-y-1">
          <div>✓ Payment confirmed</div>
          <div>🎲 Generating random traits...</div>
          <div>⛏️ Minting your Eko...</div>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <CheckCircle className="text-green-500" size={64} />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Purchase Successful!</h3>
        <p className="text-slate-400">Your random Eko has been minted and sent to your wallet</p>
      </div>
      
      {/* Mock NFT Preview */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/50 max-w-xs mx-auto">
        <div className="aspect-square bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
          <img 
            src="https://ik.imagekit.io/q9x52ygvo/Untitled.png?updatedAt=1731900408675"
            alt="Your new Eko"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="text-white font-medium">Scavenjer #4721</div>
        <div className="text-sm text-slate-400">Rare • Wasteland Explorer</div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onClose}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          View in Collection
        </button>
        <button 
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-medium transition-colors border border-slate-600"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <X className="text-red-500" size={64} />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">Purchase Failed</h3>
        <p className="text-slate-400">Something went wrong. Please try again.</p>
      </div>
      <button 
        onClick={() => setStep('payment')}
        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'payment':
        return renderPaymentStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderPaymentStep();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-700 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="text-lg font-semibold text-white">
              {step === 'payment' && 'Purchase Eko'}
              {step === 'processing' && 'Processing'}
              {step === 'success' && 'Success'}
              {step === 'error' && 'Error'}
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
