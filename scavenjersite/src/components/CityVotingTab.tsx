import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Trophy, Users, Target, CheckCircle, AlertCircle, Loader2, Plus, X, Trash2, Box } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS } from '../config/constants';
import { client } from '../client';
import { supabase, supabaseAdmin } from '../lib/supabaseClient';

interface Reward {
    type: string;
    value: string;
    imageUrl?: string;
}

interface CityEvent {
    id: number;
    city: string;
    country: string;
    description: string;
    image_url: string;
    votes_needed: number;
    current_votes: number;
    rewards: Reward[];
    status: string;
    created_at: string;
    updated_at: string;
}

interface CityVotingTabProps {
    isAdmin: boolean;
}

interface AdminCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCity: (city: Omit<CityEvent, 'id' | 'current_votes' | 'created_at' | 'updated_at'>) => Promise<void>;
    onDeleteCity: (cityId: number) => Promise<void>;
    cityEvents: CityEvent[];
}

const AdminCityModal = ({ isOpen, onClose, onAddCity, onDeleteCity, cityEvents }: AdminCityModalProps) => {
    const initialCityState = {
        city: '',
        country: '',
        description: '',
        image_url: '',
        votes_needed: 100,
        rewards: [{ type: 'NFT', value: '', imageUrl: '' }],
        status: 'active' as const
    };

    const [newCity, setNewCity] = useState(initialCityState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewCity(prev => ({ 
            ...prev, 
            [name]: name === 'votes_needed' ? parseInt(value) || 0 : value 
        }));
    };

    const handleRewardChange = (index: number, field: keyof Reward, value: string) => {
        const updatedRewards = [...newCity.rewards];
        updatedRewards[index] = { ...updatedRewards[index], [field]: value };
        setNewCity({ ...newCity, rewards: updatedRewards });
    };

    const addRewardField = () => {
        setNewCity({ ...newCity, rewards: [...newCity.rewards, { type: 'NFT', value: '', imageUrl: '' }] });
    };

    const removeRewardField = (index: number) => {
        setNewCity({ ...newCity, rewards: newCity.rewards.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAddCity(newCity);
        setIsSubmitting(false);
        setNewCity(initialCityState);
        onClose();
    };

    const inputClasses = "w-full bg-gray-900/80 border border-teal-500/30 rounded-md p-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-400 mb-1";

    if (!isOpen) return null;

    return (
        <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black border border-teal-500/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage City Events</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                    <h3 className="text-xl font-bold text-teal-400 mb-4">Add New City Event</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClasses}>City *</label>
                            <input 
                                type="text" 
                                name="city" 
                                value={newCity.city} 
                                onChange={handleChange} 
                                className={inputClasses} 
                                required 
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Country *</label>
                            <input 
                                type="text" 
                                name="country" 
                                value={newCity.country} 
                                onChange={handleChange} 
                                className={inputClasses} 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Description *</label>
                        <textarea
                            name="description"
                            value={newCity.description}
                            onChange={handleChange}
                            className={inputClasses + ' min-h-[80px]'}
                            required
                            placeholder="Describe what makes this city event special..."
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>City Image URL *</label>
                        <input 
                            type="url" 
                            name="image_url" 
                            value={newCity.image_url} 
                            onChange={handleChange} 
                            className={inputClasses} 
                            required 
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Votes Needed *</label>
                        <input 
                            type="number" 
                            name="votes_needed" 
                            value={newCity.votes_needed} 
                            onChange={handleChange} 
                            className={inputClasses} 
                            min="1"
                            required 
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Rewards</label>
                        <div className="space-y-3">
                            {newCity.rewards.map((reward, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-white/5 rounded-md">
                                    <select 
                                        value={reward.type}
                                        onChange={(e) => handleRewardChange(index, 'type', e.target.value)}
                                        className={inputClasses + ' w-32'}
                                    >
                                        <option value="NFT">NFT</option>
                                        <option value="Physical">Physical</option>
                                        <option value="Experience">Experience</option>
                                        <option value="Tech">Tech</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="Reward Description" 
                                        value={reward.value} 
                                        onChange={(e) => handleRewardChange(index, 'value', e.target.value)} 
                                        className={inputClasses} 
                                        required 
                                    />
                                    <input 
                                        type="url" 
                                        placeholder="Image URL (optional)" 
                                        value={reward.imageUrl || ''} 
                                        onChange={(e) => handleRewardChange(index, 'imageUrl', e.target.value)} 
                                        className={inputClasses} 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeRewardField(index)} 
                                        className="p-2 text-pink-500 hover:text-pink-400"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={addRewardField} 
                            className="mt-2 flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
                        >
                            <Plus size={16} /> Add Reward
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-6 py-2 rounded-md text-white bg-gradient-to-r from-teal-500 to-pink-600 hover:from-teal-600 hover:to-pink-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Creating...' : 'Create City Event'}
                        </button>
                    </div>
                </form>

                {/* Delete Section */}
                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Delete City Events
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {cityEvents.map(cityEvent => (
                            <div key={cityEvent.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                                <div className="flex-1">
                                    <span className="text-white font-medium">{cityEvent.city}, {cityEvent.country}</span>
                                    <span className="text-gray-400 text-sm ml-2">({cityEvent.current_votes}/{cityEvent.votes_needed} votes)</span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to delete ${cityEvent.city}, ${cityEvent.country}? This cannot be undone.`)) {
                                            onDeleteCity(cityEvent.id);
                                        }
                                    }}
                                    className="bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        ))}
                        {cityEvents.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No city events to delete</p>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const CityCard = ({ cityEvent, isAuthenticated, onVote, hasVoted, ownsNFT }: { 
    cityEvent: CityEvent, 
    isAuthenticated: boolean, 
    onVote: (cityId: number) => void, 
    hasVoted: boolean,
    ownsNFT: boolean 
}) => {
    const votePercentage = (cityEvent.current_votes / cityEvent.votes_needed) * 100;
    const isCompleted = cityEvent.current_votes >= cityEvent.votes_needed;

    const handleVoteClick = () => {
        if (!isAuthenticated) {
            alert('Please connect your wallet to vote.');
            return;
        }
        if (!ownsNFT) {
            alert('You must own an Eko to vote for city events.');
            return;
        }
        if (hasVoted) {
            alert('You have already voted for this city.');
            return;
        }
        onVote(cityEvent.id);
    };

    return (
        <motion.div
            className="relative border border-teal-500/20 bg-black/30 rounded-lg overflow-hidden backdrop-blur-sm group shadow-xl shadow-teal-500/10"
            style={{
                boxShadow: '0 4px 32px 0 rgba(45,212,191,0.10), 0 0 24px 2px rgba(236,72,153,0.10)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Image */}
            <div className="relative h-48 bg-gray-900">
                <img
                    src={cityEvent.image_url}
                    alt={`${cityEvent.city}, ${cityEvent.country}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Vote Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
                    <motion.div
                        className="h-full bg-gradient-to-r from-teal-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(votePercentage, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-white font-rajdhani">
                            {cityEvent.city}, {cityEvent.country}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Target className="w-4 h-4 text-teal-400" />
                            <span className="text-sm text-gray-400">
                                {cityEvent.current_votes} / {cityEvent.votes_needed} votes
                            </span>
                        </div>
                    </div>
                    {isCompleted && (
                        <div className="flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Goal Reached!
                        </div>
                    )}
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed">
                    {cityEvent.description}
                </p>

                {/* Rewards */}
                <div>
                    <h4 className="text-base font-semibold text-pink-400 mb-2 flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Event Rewards
                    </h4>
                    <div className="space-y-2">
                        {cityEvent.rewards.map((reward, index) => (
                            <div key={index} className="text-gray-300 bg-white/5 p-2 rounded-md text-xs flex items-center hover:bg-white/10 transition-colors">
                                {reward.imageUrl ? (
                                    <img 
                                        src={reward.imageUrl} 
                                        alt={reward.value} 
                                        className="w-6 h-6 mr-2 rounded-sm object-cover bg-gray-900/50" 
                                    />
                                ) : (
                                    <Box className="w-6 h-6 mr-2 text-teal-400 flex-shrink-0 p-0.5" />
                                )}
                                <span className="text-xs">
                                    <span className="text-teal-300 font-medium">{reward.type}:</span> {reward.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vote Button */}
                <div className="pt-4 border-t border-teal-500/20">
                    <button
                        onClick={handleVoteClick}
                        disabled={!isAuthenticated || !ownsNFT || hasVoted || isCompleted}
                        className={`w-full py-2 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                            hasVoted 
                                ? 'bg-green-500/20 text-green-300 cursor-default'
                                : isCompleted
                                ? 'bg-gray-600/20 text-gray-400 cursor-default'
                                : !isAuthenticated || !ownsNFT
                                ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-teal-500/20 to-pink-500/20 text-white hover:from-teal-500/40 hover:to-pink-500/40 border border-teal-500/30 hover:border-pink-500/30'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
                        {hasVoted 
                            ? 'Voted!' 
                            : isCompleted 
                            ? 'Goal Reached'
                            : !isAuthenticated 
                            ? 'Connect Wallet' 
                            : !ownsNFT
                            ? 'Need Eko to Vote'
                            : 'Vote for this City'
                        }
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default function CityVotingTab({ isAdmin }: CityVotingTabProps) {
    const account = useActiveAccount();
    const [cityEvents, setCityEvents] = useState<CityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [ownsNFT, setOwnsNFT] = useState(false);
    const [userVotes, setUserVotes] = useState<Set<number>>(new Set());
    const [checkingNFT, setCheckingNFT] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);

    const isConnected = !!account;

    // Check NFT ownership
    useEffect(() => {
        const checkNFTOwnership = async () => {
            if (!account?.address) {
                setOwnsNFT(false);
                return;
            }

            setCheckingNFT(true);
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

                setOwnsNFT(ownedNFTs.length > 0);
            } catch (error) {
                console.error('Error checking NFT ownership:', error);
                setOwnsNFT(false);
            } finally {
                setCheckingNFT(false);
            }
        };

        checkNFTOwnership();
    }, [account?.address]);

    // Fetch city events
    useEffect(() => {
        const fetchCityEvents = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('city_events')
                .select('*')
                .eq('status', 'active')
                .order('current_votes', { ascending: false });

            if (error) {
                console.error('Error fetching city events:', error);
            } else {
                setCityEvents(data as CityEvent[]);
            }
            setLoading(false);
        };

        fetchCityEvents();
    }, []);

    // Fetch user votes
    useEffect(() => {
        const fetchUserVotes = async () => {
            if (!account?.address) {
                setUserVotes(new Set());
                return;
            }

            const { data, error } = await supabase
                .from('city_votes')
                .select('city_event_id')
                .eq('wallet_address', account.address.toLowerCase());

            if (error) {
                console.error('Error fetching user votes:', error);
            } else if (data) {
                const votedIds = new Set<number>(data.map((vote: { city_event_id: number }) => vote.city_event_id));
                setUserVotes(votedIds);
            }
        };

        fetchUserVotes();
    }, [account?.address]);

    const handleVote = async (cityId: number) => {
        if (!account?.address || !ownsNFT || userVotes.has(cityId)) return;

        try {
            const { error } = await supabase.rpc('increment_city_vote', {
                event_id: cityId,
                wallet: account.address.toLowerCase()
            });

            if (error) {
                console.error('Error voting:', error);
                if (error.message.includes('duplicate key')) {
                    alert('You have already voted for this city!');
                    setUserVotes(prev => new Set([...prev, cityId]));
                } else {
                    alert(`Error: ${error.message}`);
                }
            } else {
                // Update local state
                setUserVotes(prev => new Set([...prev, cityId]));
                setCityEvents(prev => 
                    prev.map(city => 
                        city.id === cityId 
                            ? { ...city, current_votes: city.current_votes + 1 }
                            : city
                    )
                );
            }
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to submit vote. Please try again.');
        }
    };

    const addCityEvent = async (newCityEvent: Omit<CityEvent, 'id' | 'current_votes' | 'created_at' | 'updated_at'>) => {
        if (!supabaseAdmin) {
            alert('Admin functionality not available. Please add VITE_SUPABASE_SERVICE_KEY to environment variables.');
            return;
        }

        const { error } = await supabaseAdmin.from('city_events').insert([newCityEvent]);
        if (error) {
            console.error('Error creating city event:', error);
            alert(`Error: ${error.message}`);
        } else {
            // Refresh the list
            const { data } = await supabase
                .from('city_events')
                .select('*')
                .eq('status', 'active')
                .order('current_votes', { ascending: false });
            if (data) setCityEvents(data as CityEvent[]);
        }
    };

    const deleteCityEvent = async (cityId: number) => {
        if (!supabaseAdmin) {
            alert('Admin functionality not available.');
            return;
        }

        const { error } = await supabaseAdmin.from('city_events').delete().eq('id', cityId);
        if (error) {
            console.error('Error deleting city event:', error);
            alert(`Error: ${error.message}`);
        } else {
            setCityEvents(prev => prev.filter(city => city.id !== cityId));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#2DD4BF] via-[#EC4899] to-[#2DD4BF] bg-clip-text text-transparent font-rajdhani mb-4">
                    Vote for Your City
                </h2>
                <p className="text-xl text-gray-400 mb-6">
                    Help us decide where to host the next AR events. Vote with your Eko!
                </p>

                {/* NFT Status */}
                {isConnected && (
                    <div className="flex justify-center mb-6">
                        {checkingNFT ? (
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Verifying Eko ownership...</span>
                            </div>
                        ) : ownsNFT ? (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Verified Eko holder - You can vote!</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">You need to own an Eko to vote</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Admin Button */}
            {isAdmin && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowAdminModal(true)}
                        className="flex items-center gap-2 bg-purple-600/20 border border-purple-500 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-600/40 hover:text-white transition-colors font-semibold"
                    >
                        <Plus size={18} />
                        <span>Manage Cities</span>
                    </button>
                </div>
            )}

            {/* Admin Modal */}
            <AdminCityModal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onAddCity={addCityEvent}
                onDeleteCity={deleteCityEvent}
                cityEvents={cityEvents}
            />

            {/* City Events Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 text-teal-400 animate-spin" />
                    <p className="text-lg text-gray-400">Loading city events...</p>
                </div>
            ) : cityEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {cityEvents.map(cityEvent => (
                        <CityCard
                            key={cityEvent.id}
                            cityEvent={cityEvent}
                            isAuthenticated={isConnected}
                            onVote={handleVote}
                            hasVoted={userVotes.has(cityEvent.id)}
                            ownsNFT={ownsNFT}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-xl font-semibold text-white mb-2">No City Events Yet</h3>
                    <p className="text-gray-400">
                        City voting events will appear here when they become available.
                    </p>
                </div>
            )}
        </div>
    );
} 