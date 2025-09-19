import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, AlertCircle, CheckCircle, Loader2, Info, Mail, Phone, Users, Hash, Zap, Clock, Target, RefreshCcw } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS } from '../config/constants';
import { client } from '../client';
import { supabase } from '../lib/supabaseClient';

interface DropRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DropRequestModal({ isOpen, onClose }: DropRequestModalProps) {
  const account = useActiveAccount();
  const [formData, setFormData] = useState({
    city: '',
    country: '',
    area_description: '',
    reward_preference: '',
    email: '',
    phone: '',
    discord_username: '',
    social_username: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const [ownsNFT, setOwnsNFT] = useState(false);
  const [nftCount, setNftCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [canRequest, setCanRequest] = useState<boolean | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check NFT ownership when wallet connects
  useEffect(() => {
    const verifyNFTOwnership = async (isRetry = false) => {
      if (!account?.address) {
        setOwnsNFT(false);
        setVerificationStatus('idle');
        setVerificationError(null);
        return;
      }

      if (!isRetry) {
        setRetryCount(0);
      }
      
      setVerificationStatus('verifying');
      setVerificationError(null);
      
      console.log('🔍 Starting Eko verification for wallet:', account.address);
      console.log('📄 Using NFT Collection Address:', NFT_COLLECTION_ADDRESS);
      console.log('🌐 Using Polygon network');
      
      try {
        const collectionContract = getContract({
          client,
          chain: polygon,
          address: NFT_COLLECTION_ADDRESS,
        });

        console.log('📝 Contract instance created successfully');

        const ownedNFTs = await getOwnedNFTs({
          contract: collectionContract,
          owner: account.address,
        });

        console.log('✅ getOwnedNFTs call successful, found:', ownedNFTs.length, 'NFTs');
        console.log('📊 NFT Details:', ownedNFTs.map(nft => ({ 
          id: nft.id, 
          tokenId: nft.metadata?.id || 'unknown'
        })));

        const count = ownedNFTs.length;
        setNftCount(count);
        setOwnsNFT(count > 0);
        setVerificationStatus(count > 0 ? 'verified' : 'failed');
        
        if (count === 0) {
          setVerificationError('No Eko NFTs found in your wallet. Make sure you own at least one Eko from the official collection.');
        }
      } catch (error) {
        console.error('❌ Error verifying NFT ownership:', error);
        console.error('🔗 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          wallet: account.address,
          contract: NFT_COLLECTION_ADDRESS,
          chain: 'polygon'
        });
        
        setVerificationStatus('failed');
        setOwnsNFT(false);
        
        let errorMessage = 'Failed to verify Eko ownership. ';
        if (error instanceof Error) {
          if (error.message.includes('rate limit')) {
            errorMessage += 'Rate limit exceeded. Please try again in a moment.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += 'Network error. Please check your connection and try again.';
          } else if (error.message.includes('timeout')) {
            errorMessage += 'Request timed out. Please try again.';
          } else {
            errorMessage += `Error: ${error.message}`;
          }
        } else {
          errorMessage += 'Unknown error occurred.';
        }
        
        setVerificationError(errorMessage);
      }
    };

    if (isOpen) {
      verifyNFTOwnership();
    }
  }, [account?.address, isOpen]);

  // Retry verification function
  const retryVerification = async () => {
    if (retryCount >= 3) {
      setVerificationError('Maximum retry attempts reached. Please refresh the page and try again.');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    console.log(`🔄 Retrying Eko verification (attempt ${retryCount + 1}/3)`);
    
    if (!account?.address) return;
    
    setVerificationStatus('verifying');
    setVerificationError(null);
    
    try {
      const collectionContract = getContract({
        client,
        chain: polygon,
        address: NFT_COLLECTION_ADDRESS,
      });

      const ownedNFTs = await getOwnedNFTs({
        contract: collectionContract,
        owner: account.address,
      });

      const count = ownedNFTs.length;
      setNftCount(count);
      setOwnsNFT(count > 0);
      setVerificationStatus(count > 0 ? 'verified' : 'failed');
      
      if (count === 0) {
        setVerificationError('No Eko NFTs found in your wallet. Make sure you own at least one Eko from the official collection.');
      }
    } catch (error) {
      console.error('❌ Retry failed:', error);
      setVerificationStatus('failed');
      setOwnsNFT(false);
      setVerificationError('Retry failed. Please refresh the page and try again.');
    }
  };

  // Check if user can request (hasn't requested in last 30 days)
  useEffect(() => {
    const checkRequestEligibility = async () => {
      if (!account?.address || !ownsNFT) {
        setCanRequest(null);
        return;
      }

      setCheckingEligibility(true);
      try {
        const { data, error } = await supabase.rpc('can_request_drop', {
          wallet: account.address.toLowerCase()
        });

        if (error) throw error;
        setCanRequest(data);
        if (!data) {
          setError('You have already submitted a drop request in the last 30 days. Please wait before submitting another.');
        }
      } catch (error) {
        console.error('Error checking eligibility:', error);
        setError('Failed to check request eligibility');
      } finally {
        setCheckingEligibility(false);
      }
    };

    if (ownsNFT) {
      checkRequestEligibility();
    }
  }, [account?.address, ownsNFT]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const handleDifficultySelect = (difficulty: string) => {
    setFormData(prev => ({ ...prev, reward_preference: difficulty }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.address || !ownsNFT || !canRequest) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('drop_requests')
        .insert([{
          wallet_address: account.address.toLowerCase(),
          ...formData
        }]);

      if (error) throw error;

      // Reset form and show success
      setFormData({
        city: '',
        country: '',
        area_description: '',
        reward_preference: '',
        email: '',
        phone: '',
        discord_username: '',
        social_username: ''
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting drop request:', error);
      if (error.message?.includes('can_request_drop')) {
        setError('You have already submitted a drop request in the last 30 days.');
      } else {
        setError('Failed to submit drop request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  const inputClasses = "w-full bg-gray-900/80 border border-teal-500/30 rounded-md p-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-400 mb-1";

  const difficultyOptions = [
    {
      id: 'high',
      title: 'High Difficulty',
      description: 'Higher Reward, Less Time, Smaller Drop Radius, More Individual Drops to search through',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-red-500 to-orange-500',
      borderColor: 'border-red-500/50'
    },
    {
      id: 'medium',
      title: 'Medium Difficulty',
      description: 'Mid-Grade Reward, More time, Average Drop Radius, Less Individual Drops to search through',
      icon: <Target className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500/50'
    },
    {
      id: 'low',
      title: 'Low Difficulty',
      description: 'Low Reward, Much more time, Large Drop Radius, Lesser Individual Drops to search through',
      icon: <Clock className="w-5 h-5" />,
      color: 'from-green-500 to-teal-500',
      borderColor: 'border-green-500/50'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-black border border-teal-500/20 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[75vh] overflow-y-auto"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success State */}
          {submitted ? (
            <div className="text-center py-6 sm:py-8">
              <div className="mb-4 sm:mb-6">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300 text-base sm:text-lg leading-relaxed px-2">
                  Your drop request has been submitted successfully. Please keep an eye on your email and keep your phone close for when a Host has approved your drop and for further details.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-teal-500 to-pink-600 hover:from-teal-600 hover:to-pink-700 transition-all"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                  Request AR Drop
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} className="sm:hidden" />
                  <X size={24} className="hidden sm:block" />
                </button>
              </div>

              {/* NFT Verification Status */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                {verificationStatus === 'verifying' && (
                  <div className="flex items-center gap-3 text-yellow-400">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <div className="flex-1">
                      <span className="text-sm sm:text-base">Verifying Eko ownership...</span>
                      {retryCount > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          Attempt {retryCount + 1}/3
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {verificationStatus === 'verified' && (
                  <div className="flex items-center gap-3 text-green-400">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">Verified! You own {nftCount} Eko{nftCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                {verificationStatus === 'failed' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-red-400">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm sm:text-base mb-1">
                          {verificationError || 'You must own at least one Eko to request a drop'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Collection Address: {NFT_COLLECTION_ADDRESS}
                        </div>
                      </div>
                    </div>
                    {retryCount < 3 && (
                      <button
                        onClick={retryVerification}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-500/50 text-red-300 rounded-md hover:bg-red-600/30 transition-colors text-sm"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        Retry Verification
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Eligibility Check */}
              {checkingEligibility && (
                <div className="mb-4 flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Checking request eligibility...</span>
                </div>
              )}

              {/* Error Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Location Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    Location Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className={labelClasses} htmlFor="city">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                        disabled={!ownsNFT || !canRequest}
                        placeholder="e.g., New York"
                      />
                    </div>
                    <div>
                      <label className={labelClasses} htmlFor="country">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                        disabled={!ownsNFT || !canRequest}
                        placeholder="e.g., USA"
                      />
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4">
                    <label className={labelClasses} htmlFor="area_description">
                      Area Description *
                    </label>
                    <textarea
                      name="area_description"
                      value={formData.area_description}
                      onChange={handleChange}
                      className={inputClasses + ' min-h-[60px] sm:min-h-[80px]'}
                      required
                      disabled={!ownsNFT || !canRequest}
                      placeholder="Describe the area where you'd like the drop (landmarks, neighborhoods, etc.)"
                    />
                  </div>
                </div>

                {/* How to Contact You */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    How to Contact You
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className={labelClasses} htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                        disabled={!ownsNFT || !canRequest}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className={labelClasses} htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClasses}
                        disabled={!ownsNFT || !canRequest}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div>
                      <label className={labelClasses} htmlFor="discord_username">Discord Username</label>
                      <input
                        type="text"
                        name="discord_username"
                        value={formData.discord_username}
                        onChange={handleChange}
                        className={inputClasses}
                        disabled={!ownsNFT || !canRequest}
                        placeholder="username#1234"
                      />
                    </div>
                    <div>
                      <label className={labelClasses} htmlFor="social_username">Primary Social Media Username</label>
                      <input
                        type="text"
                        name="social_username"
                        value={formData.social_username}
                        onChange={handleChange}
                        className={inputClasses}
                        disabled={!ownsNFT || !canRequest}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    Difficulty Preference
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {difficultyOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => !(!ownsNFT || !canRequest) && handleDifficultySelect(option.id)}
                        className={`
                          relative p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer
                          ${formData.reward_preference === option.id 
                            ? `${option.borderColor} bg-gradient-to-r ${option.color} bg-opacity-10` 
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                          }
                          ${(!ownsNFT || !canRequest) ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`
                            p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${option.color} text-white flex-shrink-0
                            ${formData.reward_preference === option.id ? 'opacity-100' : 'opacity-70'}
                          `}>
                            {option.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">{option.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{option.description}</p>
                          </div>
                          {formData.reward_preference === option.id && (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 sm:mt-3 italic">
                    Note: Drop requests can be broken down into multiple individual drops depending on the reward.
                  </p>
                </div>

                {/* Drop Information Box */}
                <div className="p-3 sm:p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-blue-300 font-medium mb-2 text-sm sm:text-base">Drop Information</h3>
                      <ul className="text-blue-200 text-xs sm:text-sm space-y-1 list-disc list-inside">
                        <li>Drops are placed within a 1-5 mile radius of the given location</li>
                        <li>The time given to find the drop will be based on the reward value and the perceived difficulty of the area you are navigating to find the item</li>
                        <li>Drop approval times may vary depending on current traffic as Scavenjer is still in its infancy</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !ownsNFT || !canRequest || checkingEligibility}
                    className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-teal-500 to-pink-600 hover:from-teal-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all order-1 sm:order-2"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 