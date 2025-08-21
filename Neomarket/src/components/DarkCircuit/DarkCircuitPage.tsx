import React, { useState, useEffect, useCallback } from 'react';
import { getContract, readContract, prepareEvent } from "thirdweb";
import { useActiveAccount, MediaRenderer, useContractEvents } from "thirdweb/react";
import { client } from '../../client';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS } from '../../config/constants';
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

// Floating orbs animation component - optimized for performance
const FloatingOrbs = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-cyan-400/15 to-purple-400/15 blur-lg"
                style={{
                    left: `${20 + i * 20}%`,
                    top: `${20 + i * 15}%`,
                    width: `${60 + i * 20}px`,
                    height: `${60 + i * 20}px`,
                }}
                animate={{
                    x: [0, 30, 0],
                    y: [0, 20, 0],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 15 + i * 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
            />
        ))}
    </div>
));

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

export default function DarkCircuitPage() {
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

    // Calculate current period based on weeks since launch
    const calculateCurrentPeriod = useCallback(() => {
        const now = Date.now();
        const weeksElapsed = Math.floor((now - LAUNCH_EPOCH) / (7 * 24 * 60 * 60 * 1000));
        const currentWeek = Math.max(1, weeksElapsed + 1);
        
        // Calculate period based on bi-weekly rotation
        const period = Math.floor(currentWeek / 2) + 1;
        setCurrentPeriod(period);
        
        // Calculate next rotation date
        const currentPeriodStart = LAUNCH_EPOCH + ((period - 1) * 2 * 7 * 24 * 60 * 60 * 1000);
        const nextRotationDate = new Date(currentPeriodStart + (2 * 7 * 24 * 60 * 60 * 1000));
        setNextRotation(nextRotationDate);
    }, []);

    // Fetch total supply from contract with caching
    const fetchTotalSupply = useCallback(async () => {
        // Skip if we fetched recently (within 5 minutes)
        if (lastSupplyUpdate && Date.now() - lastSupplyUpdate.getTime() < 5 * 60 * 1000) {
            return;
        }

        try {
            const supply = await readContract({
                contract: nftContract,
                method: "function totalSupply() view returns (uint256)",
                params: [],
            });
            
            const supplyNumber = Number(supply);
            if (supplyNumber !== totalSupply) {
                if (totalSupply > 0) setSupplyChanged(true);
                setTotalSupply(supplyNumber);
                setLastSupplyUpdate(new Date());
            }
        } catch (error) {
            console.error('Error fetching total supply:', error);
        }
    }, [totalSupply, lastSupplyUpdate]);

    // Get featured NFT based on current period
    const getFeaturedNft = useCallback(async () => {
        try {
            if (totalSupply === 0) return;
            
            // Use a deterministic algorithm to select NFT based on period
            const seed = currentPeriod * 12345;
            const featuredTokenId = BigInt((seed % totalSupply) + 1);
            
            const nft = await getNFT({
                contract: nftContract,
                tokenId: featuredTokenId,
            });
            
            setFeaturedNft(nft);
        } catch (error) {
            console.error('Error fetching featured NFT:', error);
        }
    }, [totalSupply, currentPeriod]);

    // Check if user owns the featured NFT
    const checkOwnership = useCallback(async () => {
        if (!activeAccount || !featuredNft) {
            setIsOwner(false);
            return;
        }
        
        try {
            const ownedNfts = await getOwnedNFTs({
                contract: nftContract,
                owner: activeAccount.address,
            });
            
            const owns = ownedNfts.some(nft => nft.id === featuredNft.id);
            setIsOwner(owns);
        } catch (error) {
            console.error('Error checking ownership:', error);
            setIsOwner(false);
        }
    }, [activeAccount, featuredNft]);

    // Manual refresh function
    const handleManualRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchTotalSupply();
            await getFeaturedNft();
        } finally {
            setRefreshing(false);
        }
    }, [fetchTotalSupply, getFeaturedNft]);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitRewardForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingForm(true);
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            setFormSubmitted(true);
            setShowRewardForm(false);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmittingForm(false);
        }
    };

    // Format time until next rotation
    const formatTimeUntilNext = () => {
        if (!nextRotation) return "Calculating...";
        
        const now = new Date();
        const diff = nextRotation.getTime() - now.getTime();
        
        if (diff <= 0) return "Rotating...";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    // Format last update time
    const formatLastUpdate = () => {
        if (!lastSupplyUpdate) return "Never";
        const now = new Date();
        const diff = now.getTime() - lastSupplyUpdate.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // Initialize data
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                calculateCurrentPeriod();
                await fetchTotalSupply();
            } catch (error) {
                setError('Failed to initialize quantum state');
                console.error('Initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [calculateCurrentPeriod, fetchTotalSupply]);

    // Load featured NFT separately after total supply is available
    useEffect(() => {
        if (totalSupply > 0 && currentPeriod > 0) {
            getFeaturedNft();
        }
    }, [totalSupply, currentPeriod, getFeaturedNft]);

    // Check ownership when account or featured NFT changes (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkOwnership();
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [checkOwnership]);

    // Auto refresh
    useEffect(() => {
        const interval = setInterval(fetchTotalSupply, REFRESH_INTERVAL);
        const backupInterval = setInterval(fetchTotalSupply, BACKUP_REFRESH_INTERVAL);
        
        return () => {
            clearInterval(interval);
            clearInterval(backupInterval);
        };
    }, [fetchTotalSupply]);

    // Loading state
    if (loading) {
        return (
            <div className="h-screen bg-gradient-to-br from-black via-purple-900/10 to-black text-white relative overflow-hidden flex items-center justify-center">
                <FloatingOrbs />
                <CircuitPattern />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-2 border-cyan-400/30 rounded-full mx-auto mb-6"
                    >
                        <div className="w-full h-full border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                    </motion.div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        Initializing Quantum State
                    </h2>
                    <p className="text-gray-400">Connecting to the dark circuit...</p>
                </motion.div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="h-screen bg-gradient-to-br from-black via-purple-900/10 to-black text-white relative overflow-hidden flex items-center justify-center">
                <FloatingOrbs />
                <CircuitPattern />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10 max-w-md mx-auto px-4"
                >
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Quantum Interference Detected</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-purple-500 transition-all duration-300"
                    >
                        Retry Connection
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/10 to-black text-white relative overflow-hidden">
            <FloatingOrbs />
            <CircuitPattern />
            
            {/* Main Content - Compact Layout */}
            <div className="relative z-10 px-3 py-4 space-y-6 max-w-full overflow-hidden">
                {/* Hero Header - Compact */}
                <motion.div 
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 relative"
                >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                    
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8"
                    >
                        <div className="w-16 h-16 border-2 border-cyan-400/30 rounded-full">
                            <div className="w-full h-full border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                        </div>
                    </motion.div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center justify-center mb-4"
                        >
                            <Zap className="w-5 h-5 text-cyan-400 mr-2" />
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-wider text-center" style={{fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace"}}>
                                THE DARK CIRCUIT
                            </h1>
                            <Zap className="w-5 h-5 text-purple-400 ml-2" />
                        </motion.div>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm md:text-base text-gray-300 mb-6 max-w-xl mx-auto px-4 text-center"
                        >
                            Enter the quantum realm where <span className="text-cyan-400 font-semibold">lucky Eko holders</span> receive 
                            <span className="text-purple-400 font-semibold"> bi-weekly rewards</span> from the digital ether
                        </motion.p>

                        {/* Enhanced Stats Row - Compact */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap justify-center gap-2 md:gap-3 px-4"
                        >
                            {/* Period Card */}
                            <motion.div 
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-3 min-w-[120px]">
                                    <div className="flex items-center justify-center mb-2">
                                        <Crown className="w-3 h-3 text-cyan-400 mr-1" />
                                        <div className="text-cyan-400 text-xs font-medium font-mono">Current Cycle</div>
                                    </div>
                                    <div className="text-2xl font-black text-white mb-1 text-center font-mono">#{currentPeriod}</div>
                                    <div className="text-xs text-cyan-300/70 text-center font-mono">Quantum Phase</div>
                                </div>
                            </motion.div>

                            {/* Total Supply Card */}
                            <motion.div 
                                whileHover={{ scale: 1.05, rotateY: -5 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-xl p-3 min-w-[140px]">
                                    <div className="flex items-center justify-center mb-2">
                                        <Stars className="w-3 h-3 text-purple-400 mr-1" />
                                        <span className="text-purple-400 text-xs font-medium font-mono mr-1">Circuit Nodes</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleManualRefresh}
                                            disabled={refreshing}
                                            className="text-purple-400 hover:text-purple-300 disabled:opacity-50 p-1 rounded hover:bg-purple-500/20 transition-all"
                                            title="Refresh quantum state"
                                        >
                                            <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
                                        </motion.button>
                                    </div>
                                    <div className="text-2xl font-black text-white mb-1 text-center font-mono">{totalSupply}</div>
                                    <div className="text-xs text-purple-300/70 text-center font-mono">Updated: {formatLastUpdate()}</div>
                                    {supplyChanged && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"
                                        />
                                    )}
                                </div>
                            </motion.div>

                            {/* Countdown Card */}
                            <motion.div 
                                whileHover={{ scale: 1.05, rotateY: 5 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                                <div className="relative bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-xl p-3 min-w-[130px]">
                                    <div className="flex items-center justify-center mb-2">
                                        <Clock className="w-3 h-3 text-pink-400 mr-1" />
                                        <div className="text-pink-400 text-xs font-medium font-mono">Next Shift</div>
                                    </div>
                                    <div className="text-xl font-black text-white mb-1 text-center font-mono">{formatTimeUntilNext()}</div>
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
                                    className="mt-6 max-w-md mx-auto"
                                >
                                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/40 rounded-xl p-3">
                                        <div className="flex items-center text-green-400">
                                            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                                            <span className="font-semibold text-sm">New Ekos detected in the circuit!</span>
                                            <button
                                                onClick={() => setSupplyChanged(false)}
                                                className="ml-auto text-green-300 hover:text-green-200 text-lg font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <p className="text-green-300/80 text-xs mt-1 ml-6">Collection expanded to {totalSupply} nodes</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Featured NFT Section - Compact */}
                {featuredNft && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="max-w-6xl mx-auto"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-center">
                            {/* NFT Display - Compact */}
                            <div className="relative">
                                <motion.div 
                                    whileHover={{ scale: 1.02, rotateY: 3 }}
                                    className="group relative"
                                >
                                    {/* Glow effect */}
                                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                    
                                    {/* Main NFT Container */}
                                    <div className="relative bg-black/30 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
                                                    className="absolute top-2 right-2"
                                                >
                                                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-2 shadow-lg">
                                                        <CheckCircle className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur opacity-50 animate-pulse"></div>
                                                </motion.div>
                                            )}
                                            
                                            {/* Featured badge */}
                                            <div className="absolute top-2 left-2">
                                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg">
                                                    ✨ FEATURED
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* NFT Info Bar - Compact */}
                                        <div className="p-4 bg-gradient-to-r from-black/50 to-gray-900/50 backdrop-blur-xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        {featuredNft.metadata.name || `Eko #${featuredNft.tokenId}`}
                                                    </h3>
                                                    <p className="text-xs text-gray-400">Token ID: #{featuredNft.tokenId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-cyan-400 font-medium">Current Epoch</div>
                                                    <div className="text-base font-bold text-white">#{currentPeriod}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* NFT Info & Actions - Compact */}
                            <div className="space-y-6">
                                <div>
                                    <motion.h2 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                    >
                                        {featuredNft.metadata.name || `Quantum Eko #${featuredNft.tokenId}`}
                                    </motion.h2>
                                    <motion.p 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-gray-300 text-sm md:text-base leading-relaxed"
                                    >
                                        {featuredNft.metadata.description || 'A unique digital entity selected by the quantum algorithm for this temporal phase.'}
                                    </motion.p>
                                </div>

                                {/* Reward Status Card - Compact */}
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-20"></div>
                                    <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 md:p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                                                <Gift className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Quantum Reward Status</h3>
                                                <p className="text-gray-400 text-sm">Current epoch eligibility check</p>
                                            </div>
                                        </div>
                                        
                                        {!activeAccount ? (
                                            <div className="text-center py-6">
                                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                                                    <User className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-gray-400">Connect your wallet to access the quantum realm</p>
                                            </div>
                                        ) : isOwner ? (
                                            <div className="space-y-4">
                                                <motion.div 
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-xl p-4"
                                                >
                                                    <div className="flex items-center text-green-400 mb-3">
                                                        <CheckCircle className="w-5 h-5 mr-2" />
                                                        <span className="text-lg font-bold">Quantum Entanglement Confirmed!</span>
                                                    </div>
                                                    <p className="text-green-300 mb-4 text-sm">
                                                        Your wallet signature matches the quantum signature of this Eko. 
                                                        You are eligible to claim your epoch reward from the digital ether.
                                                    </p>
                                                    
                                                    {formSubmitted ? (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-green-900/30 border border-green-400/50 rounded-xl p-4 text-center"
                                                        >
                                                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                                                                <CheckCircle className="w-6 h-6 text-white" />
                                                            </div>
                                                            <h4 className="text-lg font-bold text-green-400 mb-2">
                                                                Quantum Transmission Complete!
                                                            </h4>
                                                            <p className="text-green-300 mb-3 text-sm">
                                                                Your reward claim has been successfully transmitted to the quantum network. 
                                                                The Scavenjer Team will be reaching out as soon as possible.
                                                            </p>
                                                            <div className="bg-green-800/30 rounded-lg p-3">
                                                                <p className="text-green-200 text-xs">
                                                                    Quantum signature: {activeAccount.address.slice(0, 8)}...{activeAccount.address.slice(-6)}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setShowRewardForm(true)}
                                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 text-sm"
                                                        >
                                                            Claim Quantum Reward
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                                                    <AlertCircle className="w-6 h-6 text-white" />
                                                </div>
                                                <p className="text-gray-400 mb-2">Quantum entanglement not detected</p>
                                                <p className="text-gray-500 text-sm">This Eko is not currently in your digital possession</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Reward Form Modal */}
            <AnimatePresence>
                {showRewardForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowRewardForm(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Quantum Reward Claim</h3>
                                <p className="text-gray-400 text-sm">Complete the transmission protocol to claim your reward</p>
                            </div>

                            <form onSubmit={handleSubmitRewardForm} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        placeholder="your.email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        <MessageSquare className="w-4 h-4 inline mr-2" />
                                        Discord Username
                                    </label>
                                    <input
                                        type="text"
                                        name="discordUsername"
                                        value={formData.discordUsername}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        placeholder="username#1234"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        <Instagram className="w-4 h-4 inline mr-2" />
                                        Social Media Handle
                                    </label>
                                    <input
                                        type="text"
                                        name="socialHandle"
                                        value={formData.socialHandle}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                        placeholder="@yourusername"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        Preferred Reward Type
                                    </label>
                                    <select
                                        name="preferredReward"
                                        value={formData.preferredReward}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                                    >
                                        <option value="">Select your preference</option>
                                        <option value="crypto">Cryptocurrency</option>
                                        <option value="nft">NFT/Digital Art</option>
                                        <option value="merchandise">Physical Merchandise</option>
                                        <option value="experience">Digital Experience</option>
                                        <option value="surprise">Surprise Me!</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-purple-400 mb-2">
                                        Additional Information
                                    </label>
                                    <textarea
                                        name="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm resize-none"
                                        placeholder="Any special requests or information..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowRewardForm(false)}
                                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingForm}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm"
                                    >
                                        {submittingForm ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : (
                                            'Submit Claim'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
