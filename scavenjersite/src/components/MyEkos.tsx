import React, { useState, useEffect } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { CONTRACT_ADDRESS, NFT_COLLECTION_ADDRESS, WMATIC_ADDRESS, USDC_ADDRESS } from '../config/constants';
import { client } from '../client';
import { polygon } from 'thirdweb/chains';
import { getNFT } from 'thirdweb/extensions/erc721';
import { MediaRenderer } from 'thirdweb/react';

const MyEkos = () => {
    const account = useActiveAccount();
    const { mutate: sendTransaction, isPending } = useSendTransaction();
    const [myListings, setMyListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [cancellingListingId, setCancellingListingId] = useState<bigint | null>(null);

    const fetchMyListings = async () => {
        if (!account) return;
        setLoading(true);
        try {
            const marketplaceContract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS });
            
            const totalListings = await readContract({
                contract: marketplaceContract,
                method: "function totalListings() view returns (uint256)",
                params: []
            });

            if (totalListings === 0n) {
                setMyListings([]);
                setLoading(false);
                return;
            }

            const allListings = await readContract({
                contract: marketplaceContract,
                method: "function getAllListings(uint256 _startId, uint256 _endId) view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved)[] _allListings)",
                params: [0n, totalListings - 1n] // Fetch all listings
            });
            
            const userListings = allListings.filter((l: any) => l.listingCreator.toLowerCase() === account.address.toLowerCase() && l.status === 1); // Status 1 for active listings

            const enrichedListings = await Promise.all(userListings.map(async (listing: any) => {
                const assetContract = getContract({ client, chain: polygon, address: listing.assetContract });
                const nft = await getNFT({ contract: assetContract, tokenId: listing.tokenId });
                return { ...listing, nft };
            }));

            setMyListings(enrichedListings);

        } catch (error) {
            console.error("Failed to fetch user listings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyListings();
    }, [account]);

    const handleCancel = (listingId: bigint) => {
        setCancellingListingId(listingId);
        const marketplaceContract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS });
        const transaction = prepareContractCall({
            contract: marketplaceContract,
            method: "function cancelListing(uint256 _listingId)",
            params: [listingId],
        });
        sendTransaction(transaction, {
            onSuccess: () => {
                // Immediately remove the listing from local state for instant feedback
                setMyListings(prev => prev.filter(listing => listing.listingId !== listingId));
                setCancellingListingId(null);
                
                // Also refetch after a short delay to ensure consistency with blockchain
                setTimeout(() => {
                    fetchMyListings();
                }, 1500);
            },
            onError: (error) => {
                console.error("Failed to cancel listing:", error);
                setCancellingListingId(null);
            }
        });
    };

    if (!account) {
        return <div className="text-center text-gray-400">Please connect your wallet to view your Ekos.</div>;
    }

    if (loading) {
        return <p>Loading your listed Ekos...</p>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Your Listed Ekos</h2>
            {myListings.length === 0 ? (
                <p>You have no active listings.</p>
            ) : (
                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4">
                    {myListings.map(listing => (
                        <div key={listing.listingId.toString()} className="lg:flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                            <div className="lg:flex items-center gap-4">
                                <MediaRenderer client={client} src={listing.nft.metadata.image} className="w-full lg:w-16 h-auto lg:h-16 rounded-md" />
                                <div className="mt-2 lg:mt-0">
                                    <p className="font-semibold text-lg">{listing.nft.metadata.name}</p>
                                    <p className="text-gray-400">
                                        {listing.currency.toLowerCase() === WMATIC_ADDRESS.toLowerCase() 
                                            ? `${Number(listing.pricePerToken) / 1e18} MATIC`
                                            : `${Number(listing.pricePerToken) / 1e6} USDC`
                                        }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCancel(listing.listingId)}
                                disabled={isPending || cancellingListingId === listing.listingId}
                                className="w-full mt-4 lg:mt-0 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {cancellingListingId === listing.listingId ? 'Cancelling...' : 'Cancel Listing'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyEkos; 