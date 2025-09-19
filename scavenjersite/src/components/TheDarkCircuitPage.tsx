import React, { useState, useEffect, useCallback } from 'react';
import { getContract, readContract, prepareEvent } from "thirdweb";
import { useActiveAccount, MediaRenderer, useContractEvents } from "thirdweb/react";
import { client } from '../client';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS } from '../config/constants';
import { getNFT, getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Gift, Clock, User, Mail, Phone, MessageSquare, Instagram, RefreshCw, AlertCircle, Zap, Stars, Crown, Sparkles } from 'lucide-react';

const nftContract = getContract({
    client,
    chain: polygon,
    address: NFT_COLLECTION_ADDRESS,
});

// Prepare events for listening to new mints and transfers
const transferEvent = prepareEvent({
    signature: "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
});

const LAUNCH_EPOCH = new Date('2024-01-01T00:00:00Z').getTime();
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BACKUP_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour backup refresh

interface RewardFormData {
    name: string;
    email: string;
    phone: string;
    discordUsername: string;
    socialHandle: string;
    preferredReward: string;
    additionalInfo: string;
}

// Floating orbs animation component
const FloatingOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-xl"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${50 + Math.random() * 100}px`,
                    height: `${50 + Math.random() * 100}px`,
                }}
                animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 10 + Math.random() * 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
        ))}
    </div>
);

// Circuit pattern background
const CircuitPattern = () => (
    <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M10 0v20M0 10h20M5 5h10M5 15h10" stroke="currentColor" strokeWidth="0.5" fill="none"/>
                    <circle cx="10" cy="10" r="1" fill="currentColor"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>
    </div>
);

export default function TheDarkCircuitPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [featuredNft, setFeaturedNft] = useState<any | null>(null);
    const [totalSupply, setTotalSupply] = useState<number>(0);
    const [currentPeriod, setCurrentPeriod] = useState<number>(0);
    const [nextRotation, setNextRotation] = useState<Date | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [showRewardForm, setShowRewardForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [submittingForm, setSubmittingForm] = useState(false);
    const [lastSupplyUpdate, setLastSupplyUpdate] = useState<Date | null>(null);
    const [supplyChanged, setSupplyChanged] = useState(false);
    const activeAccount = useActiveAccount();

    const [formData, setFormData] = useState<RewardFormData>({
        name: '',
        email: '',
        phone: '',
        discordUsername: '',
        socialHandle: '',
        preferredReward: '',
        additionalInfo: ''
    });

    const rewardOptions = [
        'Cash Reward (Randomized amount, minimum $50, through Cashapp/Paypal)',
        'Scavenjer Merchandise of Your Choice',
        'Exclusive 1-of-1 Eko Design',
        'Full marketing exposure on our socials for your brand or account'
    ];

    // Listen for Transfer events (including mints)
    const { data: transferEvents } = useContractEvents({
        contract: nftContract,
        events: [transferEvent],
    });

    // Function to fetch total supply from contract
    const fetchTotalSupply = useCallback(async (showRefreshingState = false) => {
        if (showRefreshingState) setRefreshing(true);
        
        try {
            const supply = await readContract({
                contract: nftContract,
                method: "function totalSupply() view returns (uint256)",
                params: [],
            });

            const newTotalSupply = Number(supply);
            
            // Check if supply has changed
            if (newTotalSupply !== totalSupply && totalSupply > 0) {
                setSupplyChanged(true);
                console.log(`Total supply updated: ${totalSupply} → ${newTotalSupply}`);
            }
            
            setTotalSupply(newTotalSupply);
            setLastSupplyUpdate(new Date());
            return newTotalSupply;
        } catch (error) {
            console.error('Failed to fetch total supply:', error);
            throw error;
        } finally {
            if (showRefreshingState) setRefreshing(false);
        }
    }, [totalSupply]);

    // Function to select featured NFT based on current supply
    const selectFeaturedNft = useCallback(async (currentSupply: number) => {
        try {
            if (currentSupply === 0) {
                setError("No NFTs have been minted in this collection yet.");
                return null;
            }

            // Calculate which NFT to feature based on bi-weekly rotation
            const featuredTokenId = ((currentPeriod - 1) % currentSupply) + 1;
            
            try {
                const nft = await getNFT({ 
                    contract: nftContract, 
                    tokenId: BigInt(featuredTokenId)
                });
                return { ...nft, tokenId: featuredTokenId };
            } catch (nftError) {
                // If that specific token doesn't exist, find the first available one
                let foundNft = null;
                for (let i = 0; i < Math.min(currentSupply, 100); i++) {
                    try {
                        const testNft = await getNFT({ 
                            contract: nftContract, 
                            tokenId: BigInt(i)
                        });
                        foundNft = { ...testNft, tokenId: i };
                        break;
                    } catch (e) {
                        continue;
                    }
                }
                
                if (!foundNft) {
                    throw new Error("Could not find any valid NFTs in the collection.");
                }
                
                return foundNft;
            }
        } catch (error) {
            console.error("Failed to select featured NFT:", error);
            throw error;
        }
    }, [currentPeriod]);

    // Manual refresh function
    const handleManualRefresh = useCallback(async () => {
        try {
            setError(null);
            const newSupply = await fetchTotalSupply(true);
            const newFeaturedNft = await selectFeaturedNft(newSupply);
            setFeaturedNft(newFeaturedNft);
            setSupplyChanged(false);
        } catch (error: any) {
            setError(`Failed to refresh: ${error.message}`);
        }
    }, [fetchTotalSupply, selectFeaturedNft]);

    // Calculate current bi-weekly period and next rotation
    useEffect(() => {
                const now = new Date().getTime();
        const periodIndex = Math.floor((now - LAUNCH_EPOCH) / (1000 * 60 * 60 * 24 * 14)) + 1; // Start at 1
        setCurrentPeriod(periodIndex);
        
        const nextRotationTime = new Date(LAUNCH_EPOCH + periodIndex * (1000 * 60 * 60 * 24 * 14));
        setNextRotation(nextRotationTime);
    }, []);

    // Initial fetch of total supply and featured NFT
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            setError(null);

            try {
                const supply = await fetchTotalSupply();
                const nft = await selectFeaturedNft(supply);
                setFeaturedNft(nft);
            } catch (e: any) {
                console.error("Failed to initialize data:", e);
                setError(`Could not load the featured item. ${e.message || ''}`);
            } finally {
                setLoading(false);
            }
        };

        if (currentPeriod !== null) {
            initializeData();
        }
    }, [currentPeriod, fetchTotalSupply, selectFeaturedNft]);

    // Listen for transfer events to detect new mints
    useEffect(() => {
        if (transferEvents && transferEvents.length > 0) {
            const latestEvent = transferEvents[transferEvents.length - 1];
            
            // Check if it's a mint (from address is 0x0)
            if (latestEvent.args.from === '0x0000000000000000000000000000000000000000') {
                console.log('New mint detected, refreshing total supply...');
                fetchTotalSupply().then(newSupply => {
                    // If supply changed significantly, refresh featured NFT
                    if (newSupply !== totalSupply) {
                        selectFeaturedNft(newSupply).then(newFeaturedNft => {
                            setFeaturedNft(newFeaturedNft);
                        }).catch(console.error);
                    }
                }).catch(console.error);
            }
        }
    }, [transferEvents, fetchTotalSupply, selectFeaturedNft, totalSupply]);

    // Periodic refresh (daily + backup hourly)
    useEffect(() => {
        // Daily refresh
        const dailyInterval = setInterval(() => {
            console.log('Daily refresh of total supply...');
            fetchTotalSupply().catch(console.error);
        }, REFRESH_INTERVAL);

        // Backup hourly refresh
        const hourlyInterval = setInterval(() => {
            console.log('Hourly backup refresh...');
            fetchTotalSupply().catch(console.error);
        }, BACKUP_REFRESH_INTERVAL);

        return () => {
            clearInterval(dailyInterval);
            clearInterval(hourlyInterval);
        };
    }, [fetchTotalSupply]);

    // Check if connected wallet owns the featured NFT
    useEffect(() => {
        const checkOwnership = async () => {
            if (!activeAccount?.address || !featuredNft) {
                setIsOwner(false);
                return;
            }

            try {
                const ownedNFTs = await getOwnedNFTs({
                    contract: nftContract,
                    owner: activeAccount.address,
                });

                const ownsCurrentNft = ownedNFTs.some(nft => 
                    nft.id.toString() === featuredNft.tokenId.toString()
                );
                
                setIsOwner(ownsCurrentNft);
            } catch (error) {
                console.error("Error checking ownership:", error);
                setIsOwner(false);
            }
        };

        checkOwnership();
    }, [activeAccount?.address, featuredNft]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitRewardForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingForm(true);

        try {
            // Simulate form submission - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Here you would typically send the form data to your backend
            console.log('Reward form submitted:', {
                ...formData,
                walletAddress: activeAccount?.address,
                nftTokenId: featuredNft?.tokenId,
                period: currentPeriod,
                totalSupplyAtTime: totalSupply,
                timestamp: new Date().toISOString()
            });

            setFormSubmitted(true);
            setShowRewardForm(false);
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit reward form. Please try again.');
        } finally {
            setSubmittingForm(false);
        }
    };

    const formatTimeUntilNext = () => {
        if (!nextRotation) return '';
        
        const now = new Date().getTime();
        const diff = nextRotation.getTime() - now;
        
        if (diff <= 0) return 'Rotation in progress...';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return `${days}d ${hours}h`;
    };

    const formatLastUpdate = () => {
        if (!lastSupplyUpdate) return 'Never';
        
        const now = new Date().getTime();
        const diff = now - lastSupplyUpdate.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center relative overflow-hidden">
                <FloatingOrbs />
                <CircuitPattern />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center"
                >
                    <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin text-white" />
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Initializing Dark Circuit
                    </h2>
                    <p className="text-gray-400">Connecting to the quantum network...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black flex items-center justify-center relative overflow-hidden">
                <FloatingOrbs />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center max-w-md mx-auto p-8"
                >
                    <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8">
                        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-red-400 mb-4">Circuit Disruption</h3>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => window.location.reload()}
                                className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Reload System
                            </button>
                            <button 
                                onClick={handleManualRefresh}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black text-white relative overflow-hidden">
            <FloatingOrbs />
            <CircuitPattern />
            
            {/* Main Content */}
            <div className="relative z-10 p-8">
                {/* Hero Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 relative"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                    
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12"
                    >
                        <div className="w-24 h-24 border-2 border-cyan-400/30 rounded-full">
                            <div className="w-full h-full border-t-2 border-cyan-400 rounded-full animate-spin"></div>
            </div>
                    </motion.div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center mb-6"
                        >
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mr-2 sm:mr-3" />
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider text-center" style={{fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace"}}>
                                THE DARK CIRCUIT
                            </h1>
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 ml-2 sm:ml-3" />
                        </motion.div>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 text-center"
                        >
                            Enter the quantum realm where <span className="text-cyan-400 font-semibold">lucky Eko holders</span> receive 
                            <span className="text-purple-400 font-semibold"> bi-weekly rewards</span> from the digital ether
                        </motion.p>

                        {/* Enhanced Stats Row */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 px-4"
                        >
                            {/* Period Card */}
                            <motion.div 
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-3 sm:p-4 md:p-5 min-w-[140px] sm:min-w-[170px] md:min-w-[190px]">
                                    <div className="flex items-center justify-center mb-3">
                                        <Crown className="w-4 h-4 text-cyan-400 mr-2" />
                                        <div className="text-cyan-400 text-sm font-medium font-mono">Current Cycle</div>
                                    </div>
                                    <div className="text-3xl font-black text-white mb-2 text-center font-mono">#{currentPeriod}</div>
                                    <div className="text-xs text-cyan-300/70 text-center font-mono">Quantum Phase</div>
                                </div>
                            </motion.div>

                            {/* Total Supply Card */}
                            <motion.div 
                                whileHover={{ scale: 1.05, rotateY: -5 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 sm:p-4 md:p-5 min-w-[150px] sm:min-w-[180px] md:min-w-[200px]">
                                    <div className="flex items-center justify-center mb-3">
                                        <Stars className="w-4 h-4 text-purple-400 mr-2" />
                                        <span className="text-purple-400 text-sm font-medium font-mono mr-2">Circuit Nodes</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleManualRefresh}
                                            disabled={refreshing}
                                            className="text-purple-400 hover:text-purple-300 disabled:opacity-50 p-1 rounded-lg hover:bg-purple-500/20 transition-all"
                                            title="Refresh quantum state"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                                        </motion.button>
                                    </div>
                                    <div className="text-3xl font-black text-white mb-2 text-center font-mono">{totalSupply}</div>
                                    <div className="text-xs text-purple-300/70 text-center font-mono">Updated: {formatLastUpdate()}</div>
                                    {supplyChanged && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"
                                        />
                                    )}
                                </div>
                            </motion.div>

                            {/* Countdown Card */}
                            <motion.div 
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-3 sm:p-4 md:p-5 min-w-[160px] sm:min-w-[190px] md:min-w-[210px]">
                                    <div className="flex items-center justify-center mb-3">
                                        <Clock className="w-4 h-4 text-pink-400 mr-2" />
                                        <div className="text-pink-400 text-sm font-medium font-mono">Next Shift</div>
                                    </div>
                                    <div className="text-2xl font-black text-white mb-2 text-center font-mono">{formatTimeUntilNext()}</div>
                                    <div className="text-xs text-pink-300/70 text-center font-mono">Temporal Flux</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Supply Change Notification */}
                        <AnimatePresence>
                            {supplyChanged && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                    className="mt-8 max-w-md mx-auto"
                                >
                                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/40 rounded-2xl p-4">
                                        <div className="flex items-center text-green-400">
                                            <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                                            <span className="font-semibold">New Ekos detected in the circuit!</span>
                                            <button
                                                onClick={() => setSupplyChanged(false)}
                                                className="ml-auto text-green-300 hover:text-green-200 text-xl font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <p className="text-green-300/80 text-sm mt-1 ml-8">Collection expanded to {totalSupply} nodes</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Featured NFT Section */}
                {featuredNft && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="max-w-7xl mx-auto mb-12 sm:mb-16 md:mb-20 px-4"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
                            {/* NFT Display */}
                            <div className="relative">
                                <motion.div 
                                    whileHover={{ scale: 1.02, rotateY: 5 }}
                                    className="group relative"
                                >
                                    {/* Glow effect */}
                                    <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                                    
                                    {/* Main NFT Container */}
                                    <div className="relative bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                                        <div className="aspect-square bg-gradient-to-br from-gray-900/50 to-black/50 relative overflow-hidden">
                                            <MediaRenderer 
                                                client={client} 
                                                src={featuredNft.metadata.image} 
                                                className="w-full h-full object-cover" 
                                            />
                                            
                                            {/* Overlay gradients */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10"></div>
                                            
                                            {/* Owner badge */}
                                            {isOwner && (
                                                <motion.div 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-2 right-2 sm:top-4 sm:right-4"
                                                >
                                                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-3 shadow-lg">
                                                        <CheckCircle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur opacity-50 animate-pulse"></div>
                                                </motion.div>
                                            )}
                                            
                                            {/* Featured badge */}
                                            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg">
                                                    ✨ FEATURED
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* NFT Info Bar */}
                                        <div className="p-6 bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1">
                                                        {featuredNft.metadata.name || `Eko #${featuredNft.tokenId}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">Token ID: #{featuredNft.tokenId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-cyan-400 font-medium">Current Epoch</div>
                                                    <div className="text-lg font-bold text-white">#{currentPeriod}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* NFT Info & Actions */}
                            <div className="space-y-8">
                                <div>
                                    <motion.h2 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                    >
                                        {featuredNft.metadata.name || `Quantum Eko #${featuredNft.tokenId}`}
                                    </motion.h2>
                                    <motion.p 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-gray-300 text-lg leading-relaxed"
                                    >
                                        {featuredNft.metadata.description || 'A unique digital entity selected by the quantum algorithm for this temporal phase.'}
                                    </motion.p>
                                </div>

                                {/* Reward Status Card */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur opacity-20"></div>
                                    <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                                        <div className="flex items-center mb-6">
                                            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                                                <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                                                <h3 className="text-2xl font-bold text-white">Quantum Reward Status</h3>
                                                <p className="text-gray-400">Current epoch eligibility check</p>
                                            </div>
                                        </div>
                                        
                                        {!activeAccount ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                                                    <User className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 text-lg">Connect your wallet to access the quantum realm</p>
                                            </div>
                                        ) : isOwner ? (
                                            <div className="space-y-6">
                                                <motion.div 
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-2xl p-6"
                                                >
                                                    <div className="flex items-center text-green-400 mb-4">
                                                        <CheckCircle className="w-6 h-6 mr-3" />
                                                        <span className="text-xl font-bold">Quantum Entanglement Confirmed!</span>
                                                    </div>
                                                    <p className="text-green-300 mb-6">
                                                        Your wallet signature matches the quantum signature of this Eko. 
                                                        You are eligible to claim your epoch reward from the digital ether.
                                                    </p>
                                                    
                                                    {formSubmitted ? (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-green-900/30 border border-green-400/50 rounded-2xl p-6 text-center"
                                                        >
                                                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                                                <CheckCircle className="w-10 h-10 text-white" />
                                                            </div>
                                                            <h4 className="text-2xl font-bold text-green-400 mb-4">
                                                                Quantum Transmission Complete!
                                                            </h4>
                                                            <p className="text-green-300 mb-6 text-lg">
                                                                Your reward claim has been successfully transmitted to the quantum network. 
                                                                The Scavenjer Team will be reaching out as soon as possible.
                                                            </p>
                                                            <div className="bg-green-800/30 rounded-xl p-4">
                                                                <p className="text-green-200">
                                                                    🌟 You're one step closer to receiving your exclusive reward from the digital realm!
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.button 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setShowRewardForm(true)}
                                                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                                                        >
                                                            <span className="flex items-center justify-center">
                                                                <Sparkles className="w-5 h-5 mr-2" />
                                                                Claim Quantum Reward
                                                                <Sparkles className="w-5 h-5 ml-2" />
                                                            </span>
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                                </div>
                                                <h4 className="text-xl font-bold text-red-400 mb-2">Quantum Signature Mismatch</h4>
                                                <p className="text-gray-400">
                                                    Your wallet does not possess the quantum signature of this Eko. 
                                                    Only the current holder can access this cycle's rewards.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Reward Form Modal */}
                <AnimatePresence>
                    {showRewardForm && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
                            onClick={(e) => e.target === e.currentTarget && setShowRewardForm(false)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                                className="relative w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-hidden mx-4"
                            >
                                {/* Glow effect */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
                                
                                <div className="relative bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-4 sm:p-6 border-b border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-2xl font-bold text-white mb-1">Quantum Reward Protocol</h3>
                                                <p className="text-gray-400">Initialize your reward transmission</p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setShowRewardForm(false)}
                                                className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                                            >
                                                ×
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Form Content */}
                                    <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
                                        <form onSubmit={handleSubmitRewardForm} className="space-y-6">
                                            {/* Discord Recommendation */}
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 rounded-2xl p-4"
                                            >
                                                <div className="flex items-center text-blue-400">
                                                    <MessageSquare className="w-5 h-5 mr-3" />
                                                    <span className="font-semibold">💡 Quantum Tip:</span>
                                                </div>
                                                <p className="text-blue-300 mt-2 ml-8">
                                                    Join our Discord server for faster quantum entanglement and reward delivery!
                                                </p>
                                            </motion.div>

                                            {/* Form Fields */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                        <User className="w-4 h-4 inline mr-2" />
                                                        Quantum Identity *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                                        placeholder="Enter your full name"
                                                    />
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                        <Mail className="w-4 h-4 inline mr-2" />
                                                        Quantum Address *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                                        placeholder="your@email.com"
                                                    />
                                                </motion.div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                        <Phone className="w-4 h-4 inline mr-2" />
                                                        Voice Channel <span className="text-gray-500 text-xs">(Optional)</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleFormChange}
                                                        className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                                        placeholder="+1 (555) 123-4567"
                                                    />
                                                </motion.div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                                        Discord Portal <span className="text-gray-500 text-xs">(Optional)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="discordUsername"
                                                        value={formData.discordUsername}
                                                        onChange={handleFormChange}
                                                        placeholder="username#1234"
                                                        className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                                    />
                                                </motion.div>
                                            </div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                    <Instagram className="w-4 h-4 inline mr-2" />
                                                    Social Network ID
                                                </label>
                                                <input
                                                    type="text"
                                                    name="socialHandle"
                                                    value={formData.socialHandle}
                                                    onChange={handleFormChange}
                                                    placeholder="@username or profile link"
                                                    className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                                />
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                    <Gift className="w-4 h-4 inline mr-2" />
                                                    Preferred Quantum Reward *
                                                </label>
                                                <select
                                                    name="preferredReward"
                                                    value={formData.preferredReward}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select your reward manifestation</option>
                                                    {rewardOptions.map((option, index) => (
                                                        <option key={index} value={option} className="bg-black text-white">{option}</option>
                                                    ))}
                                                </select>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-3">
                                                    Quantum Instructions
                                                </label>
                                                <textarea
                                                    name="additionalInfo"
                                                    value={formData.additionalInfo}
                                                    onChange={handleFormChange}
                                                    rows={4}
                                                    placeholder="Special requests, payment details (Cashapp/Paypal), merchandise preferences, or additional quantum data..."
                                                    className="w-full px-4 py-3 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                                                />
                                            </motion.div>

                                            {/* Submit Buttons */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 }}
                                                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6"
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="button"
                                                    onClick={() => setShowRewardForm(false)}
                                                    className="flex-1 py-3 bg-gray-600/40 hover:bg-gray-600/60 backdrop-blur-xl border border-gray-500/40 rounded-xl font-semibold text-gray-300 hover:text-white transition-all"
                                                >
                                                    Cancel Transmission
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={submittingForm}
                                                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-2xl"
                                                >
                                                    {submittingForm ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                            Transmitting...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="w-5 h-5 mr-2" />
                                                            Initiate Quantum Claim
                                                        </>
                                                    )}
                                                </motion.button>
                                            </motion.div>
                                        </form>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* How It Works Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="max-w-6xl mx-auto px-4"
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl"></div>
                        <div className="relative bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12">
                            <motion.h3 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-black text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                            >
                                Quantum Protocol Explained
                            </motion.h3>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-400 text-center mb-12 text-lg"
                            >
                                Understanding the Dark Circuit's quantum reward distribution algorithm
                            </motion.p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                {[
                                    {
                                        icon: Clock,
                                        title: "Temporal Cycles",
                                        description: "Every 14 solar rotations, the quantum algorithm selects a new Eko from the digital multiverse.",
                                        gradient: "from-cyan-500 to-blue-600"
                                    },
                                    {
                                        icon: Crown,
                                        title: "Quantum Verification",
                                        description: "Advanced blockchain cryptography confirms the true holder of the selected digital entity.",
                                        gradient: "from-purple-500 to-pink-600"
                                    },
                                    {
                                        icon: Sparkles,
                                        title: "Reward Manifestation",
                                        description: "Successful verification triggers the materialization of exclusive rewards from the digital realm.",
                                        gradient: "from-green-500 to-emerald-600"
                                    }
                                ].map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        whileHover={{ scale: 1.05, rotateY: 5 }}
                                        className="group text-center relative"
                                    >
                                        <div className="absolute -inset-2 bg-gradient-to-r opacity-0 group-hover:opacity-20 rounded-2xl blur transition-all duration-500" style={{backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`}}></div>
                                        <div className="relative">
                                            <div className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                                <step.icon className="w-10 h-10 text-white" />
                                            </div>
                                            <h4 className="text-xl font-bold text-white mb-4">{step.title}</h4>
                                            <p className="text-gray-400 leading-relaxed">{step.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {/* Technical Info */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-12 pt-8 border-t border-white/10"
                            >
                                <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                        Real-time mint detection
                                    </span>
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                                        24h quantum refresh cycles
                                    </span>
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
                                        Ownership verification
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
                </div>
        </div>
    );
} 