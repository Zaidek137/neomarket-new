import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useActiveAccount, useSendTransaction, ConnectButton } from "thirdweb/react";
import { polygon } from 'thirdweb/chains';
import { ThirdwebClient, NATIVE_TOKEN_ADDRESS } from 'thirdweb';
import { getContract, prepareContractCall, sendTransaction, toWei } from 'thirdweb';
import { Bridge } from 'thirdweb';
import { CONTRACT_ADDRESS } from '../config/constants';
import PaymentOptions from './PaymentOptions';
import SuccessStep from './SuccessStep';
import ErrorStep from './ErrorStep';
import { createWallet } from "thirdweb/wallets";

const THIRDWEB_CLIENT_ID = "dc56b7276133338ec60eebc93d1c38b1";

type BuyModalProps = {
  listing: any;
  metadata: any;
  onClose: () => void;
  client: ThirdwebClient;
  polPrice: number | null;
};

type Provider = "stripe" | "coinbase" | "transak";

interface CheckoutState {
  step: "connect" | "payment" | "processing" | "success" | "error";
  selectedProvider?: Provider;
  onrampSession?: any;
  mintTxHash?: string;
  error?: string;
}

const BuyModal: React.FC<BuyModalProps> = ({ listing, metadata, onClose, client, polPrice }) => {
  const account = useActiveAccount();
  const { mutate: sendTx } = useSendTransaction();

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ step: "connect" });

  useEffect(() => {
    if (account) {
      setCheckoutState({ step: "payment" });
    } else {
      setCheckoutState({ step: "connect" });
    }
  }, [account]);

  const priceInPol = Number(listing.pricePerToken) / 1e18;
  const priceInUsd = polPrice ? (priceInPol * polPrice) : 0;
  
  // Debug logging
  console.log('BuyModal Debug:', { 
    pricePerToken: listing.pricePerToken, 
    priceInPol, 
    polPrice, 
    priceInUsd 
  });

  const handlePaymentSelect = async (provider: Provider) => {
    if (!account) return;

    setCheckoutState({ step: 'processing', selectedProvider: provider });
    try {
      const onrampSession = await Bridge.Onramp.prepare({
        client,
        onramp: provider,
        chainId: polygon.id,
        tokenAddress: NATIVE_TOKEN_ADDRESS,
        receiver: account.address,
        amount: toWei(priceInPol.toString()),
        currency: "USD",
      });
      
      localStorage.setItem("currentOnrampSession", JSON.stringify({
        id: onrampSession.id,
        timestamp: Date.now(),
      }));

      setCheckoutState(prev => ({ ...prev, onrampSession }));
      window.open(onrampSession.link, "_blank");
      monitorOnrampAndBuy(onrampSession.id);

    } catch (error) {
      console.error("Failed to start payment:", error);
      setCheckoutState({ step: "error", error: error instanceof Error ? error.message : "Payment failed" });
    }
  };

  const monitorOnrampAndBuy = async (sessionId: string) => {
    try {
      const status = await Bridge.Onramp.status({
        id: sessionId,
        client: client,
      });

      switch (status.status) {
        case "COMPLETED":
          await buyListing();
          break;
        case "PENDING":
          setTimeout(() => monitorOnrampAndBuy(sessionId), 3000);
          break;
        case "FAILED":
          setCheckoutState({ step: "error", error: `Payment failed. Please try again.`});
          break;
        default:
          setCheckoutState({ step: "error", error: `Payment failed with status: ${status.status}`});
          break;
      }
    } catch (error) {
       console.error("Failed to check payment status:", error);
       setCheckoutState({ step: "error", error: "Failed to check payment status" });
    }
  };

  const buyListing = async () => {
    if (!account) return;

    const marketplaceContract = getContract({ client, chain: polygon, address: CONTRACT_ADDRESS });
    const transaction = prepareContractCall({
      contract: marketplaceContract,
      method: "function buyFromListing(uint256 _listingId, address _buyFor, uint256 _quantity, address _currency, uint256 _expectedTotalPrice)",
      params: [listing.listingId, account.address, listing.quantity, listing.currency, listing.pricePerToken],
      value: listing.pricePerToken,
    });
    
    try {
      const { transactionHash } = await sendTransaction({ transaction, account });
      setCheckoutState({ step: "success", mintTxHash: transactionHash });
      localStorage.removeItem("currentOnrampSession");
    } catch (error) {
      console.error("Failed to buy listing:", error);
      setCheckoutState({ step: "error", error: error instanceof Error ? error.message : "Transaction failed" });
    }
  };

  const renderContent = () => {
    switch (checkoutState.step) {
      case 'connect':
        // Configure external wallets only
        const wallets = [
          createWallet("io.metamask"),
          createWallet("com.coinbase.wallet"),
          createWallet("me.rainbow"),
          createWallet("walletConnect"),
          createWallet("com.trustwallet.app"),
          createWallet("com.okex.wallet"),
          createWallet("com.brave.wallet"),
          createWallet("com.ledger"),
        ];
        
        return (
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Please connect your wallet</h3>
            <ConnectButton 
              client={client} 
              wallets={wallets}
              connectModal={{
                size: "compact",
                showThirdwebBranding: false,
                welcomeScreen: {
                  title: "Connect your wallet",
                  subtitle: "Select an external wallet to continue",
                }
              }}
            />
          </div>
        );
      case 'payment':
        return (
          <div>
            <PaymentOptions onSelect={handlePaymentSelect} />
          </div>
        );
      case 'processing':
        const providerInfo = {
          stripe: { name: "Stripe", logo: "💳" },
          coinbase: { name: "Coinbase Pay", logo: "🟦" },
          transak: { name: "Transak", logo: "🌐" },
        };
        const info = providerInfo[checkoutState.selectedProvider || 'stripe'];

        return (
            <div className="text-center p-8">
                <div className="text-4xl mb-2 bg-gray-800 p-3 rounded-md inline-block">{info.logo}</div>
                <h3 className="text-lg font-semibold text-white">Processing with {info.name}</h3>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto my-6"></div>
                <p className="text-gray-400 mt-2">Please complete your payment in the new window. <br/>This modal will update automatically.</p>
            </div>
        );
      case 'success':
        return (
          <SuccessStep 
            txHash={checkoutState.mintTxHash!} 
            metadata={metadata}
            onClose={onClose}
          />
        );
      case 'error':
        return (
          <ErrorStep 
            error={checkoutState.error!}
            onRetry={() => setCheckoutState({ step: 'payment' })}
            onClose={onClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" 
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-gray-900 to-black border border-cyan-600/50 rounded-2xl shadow-2xl shadow-cyan-500/20 p-8 max-w-xl w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
            <button 
                onClick={onClose} 
                className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
            >
                <X size={24} />
            </button>
        </div>
        
        <div className="flex items-center gap-6 mb-8">
            {metadata.image && 
              <img src={metadata.image} alt={metadata.name} className="w-28 h-28 rounded-lg object-cover border-2 border-gray-700" />
            }
            <div>
                <h3 className="text-2xl font-semibold text-white">{metadata.name}</h3>
                {polPrice ? (
                   <p className="text-lg text-cyan-300 font-mono">
                     {priceInPol.toFixed(4)} POL (~${(priceInPol * polPrice).toFixed(2)} USD)
                   </p>
                ) : (
                   <p className="text-lg text-gray-500">Calculating price...</p>
                )}
                <p className="text-sm text-gray-400">Token ID: {listing.tokenId.toString()}</p>
            </div>
        </div>
        
        {renderContent()}

        <div className="text-center text-xs text-gray-500 mt-4">
          You can purchase with your card or any token. Thirdweb will handle the currency conversion for you.
        </div>
      </div>
    </div>
  );
};

export default BuyModal; 