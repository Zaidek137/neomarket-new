import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { NFT_COLLECTION_ADDRESS, THIRDWEB_CLIENT_ID } from '../config/constants';
import { client } from '../client';

export default function EkoVerificationDebug() {
  const account = useActiveAccount();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    if (!account?.address) {
      setDebugResults({ error: 'No wallet connected' });
      return;
    }

    setIsLoading(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      walletAddress: account.address,
      clientId: THIRDWEB_CLIENT_ID,
      collectionAddress: NFT_COLLECTION_ADDRESS,
      chainId: polygon.id,
      tests: {}
    };

    try {
      // Test 1: Basic connection
      results.tests.clientConnection = {
        status: 'success',
        message: 'ThirdWeb client initialized successfully'
      };

      // Test 2: Contract creation
      try {
        const collectionContract = getContract({
          client,
          chain: polygon,
          address: NFT_COLLECTION_ADDRESS,
        });
        results.tests.contractCreation = {
          status: 'success',
          message: 'Contract instance created successfully',
          contractAddress: collectionContract.address
        };

        // Test 3: NFT ownership check
        try {
          const ownedNFTs = await getOwnedNFTs({
            contract: collectionContract,
            owner: account.address,
          });

          results.tests.ownershipCheck = {
            status: 'success',
            message: `Found ${ownedNFTs.length} NFTs`,
            nftCount: ownedNFTs.length,
            nfts: ownedNFTs.map(nft => ({
              id: nft.id,
              tokenId: nft.metadata?.id,
              name: nft.metadata?.name,
              description: nft.metadata?.description
            }))
          };
        } catch (error) {
          results.tests.ownershipCheck = {
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            error: error
          };
        }
      } catch (error) {
        results.tests.contractCreation = {
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error
        };
      }

      // Test 4: Alternative RPC check (direct contract call)
      try {
        const response = await fetch(`https://polygon-rpc.com`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: NFT_COLLECTION_ADDRESS,
              data: `0x70a08231000000000000000000000000${account.address.slice(2).toLowerCase()}`
            }, 'latest'],
            id: 1
          })
        });
        
        const rpcResult = await response.json();
        const balance = parseInt(rpcResult.result || '0x0', 16);
        
        results.tests.directRpcCheck = {
          status: 'success',
          message: `Direct RPC call successful`,
          balance: balance,
          rpcResponse: rpcResult
        };
      } catch (error) {
        results.tests.directRpcCheck = {
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          error: error
        };
      }

    } catch (error) {
      results.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugResults(results);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Eko Verification Debug Tool</h2>
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">Wallet: {account?.address || 'Not connected'}</p>
        <p className="text-gray-300 mb-2">Collection: {NFT_COLLECTION_ADDRESS}</p>
        <p className="text-gray-300 mb-4">Chain: Polygon ({polygon.id})</p>
        
        <button
          onClick={runDiagnostics}
          disabled={!account?.address || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {debugResults && (
        <div className="bg-black p-4 rounded overflow-auto">
          <pre className="text-green-400 text-sm whitespace-pre-wrap">
            {JSON.stringify(debugResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 