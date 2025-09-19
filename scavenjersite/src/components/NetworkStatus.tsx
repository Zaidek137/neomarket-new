import React from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useNetworkMonitor } from '../hooks/useNetworkMonitor';
import { NETWORK_CONFIG } from '../config/constants';

export default function NetworkStatus() {
  const { networkStatus, error, checkNetwork } = useNetworkMonitor();

  if (!networkStatus) {
    return (
      <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg flex items-center gap-2">
        <RefreshCw className="animate-spin" size={16} />
        <span>Checking network...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2">
        <AlertTriangle size={16} />
        <span>{error}</span>
        <button
          onClick={() => checkNetwork()}
          className="ml-2 hover:text-red-400 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#2DD4BF]/10 text-[#2DD4BF] px-4 py-2 rounded-lg flex items-center gap-2">
      <CheckCircle size={16} />
      <span>Connected to {NETWORK_CONFIG.name}</span>
      <div className="text-xs text-[#2DD4BF]/60">
        Block: {networkStatus.blockNumber}
      </div>
    </div>
  );
}