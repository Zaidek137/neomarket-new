import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';

interface ErrorStepProps {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}

export default function ErrorStep({ error, onRetry, onClose }: ErrorStepProps) {
  const getErrorMessage = (error: string) => {
    if (error.includes('insufficient funds')) {
      return 'Insufficient funds in your wallet to complete this transaction.';
    }
    if (error.includes('user rejected')) {
      return 'Transaction was cancelled by user.';
    }
    if (error.includes('network')) {
      return 'Network error occurred. Please check your connection and try again.';
    }
    if (error.includes('gas')) {
      return 'Transaction failed due to gas estimation issues.';
    }
    return 'An unexpected error occurred during the transaction.';
  };

  const getErrorSuggestion = (error: string) => {
    if (error.includes('insufficient funds')) {
      return 'Please add more MATIC to your wallet and try again.';
    }
    if (error.includes('user rejected')) {
      return 'Please approve the transaction in your wallet to proceed.';
    }
    if (error.includes('network')) {
      return 'Check your internet connection and wallet network settings.';
    }
    if (error.includes('gas')) {
      return 'Try increasing the gas limit or wait for network congestion to clear.';
    }
    return 'Please try again or contact support if the issue persists.';
  };

  return (
    <div className="text-center space-y-6 p-6">
      <div className="flex justify-center">
        <AlertCircle className="w-16 h-16 text-red-400" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Transaction Failed</h2>
        <p className="text-slate-300">
          {getErrorMessage(error)}
        </p>
      </div>

      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-red-400">
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">Suggestion</span>
        </div>
        <p className="text-red-200 text-sm">
          {getErrorSuggestion(error)}
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-2">Error Details</h3>
        <p className="text-xs text-slate-500 font-mono break-all">
          {error}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Cancel
        </button>
      </div>

      <div className="text-xs text-slate-400">
        Need help? Contact support at{' '}
        <a href="mailto:support@scavenjer.com" className="text-cyan-400 hover:text-cyan-300">
          support@scavenjer.com
        </a>
      </div>
    </div>
  );
}
