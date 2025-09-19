import { useActiveAccount } from 'thirdweb/react';
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "../client";

export default function AuthButton() {
    const account = useActiveAccount();
    
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
        <div className="flex items-center gap-3">
            <ConnectButton 
                client={client}
                theme="dark"
                wallets={wallets}
                connectModal={{
                    size: "compact",
                    showThirdwebBranding: false,
                    welcomeScreen: {
                        title: "Connect your wallet",
                        subtitle: "Select an external wallet to continue",
                    },
                }}
                connectButton={{
                    label: "Connect Wallet",
                }}
            />
            {account && (
                <div className="text-sm text-gray-400">
                    Connected: {account.address?.slice(0, 6)}...{account.address?.slice(-4)}
                </div>
            )}
        </div>
    );
}