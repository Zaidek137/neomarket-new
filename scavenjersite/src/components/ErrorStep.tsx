import React from 'react';

const ErrorStep = ({
  error,
  onRetry,
  onClose,
}: {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}) => {
  return (
    <div className="text-center space-y-5">
      <div className="text-5xl">😞</div>
      <div>
        <h3 className="text-2xl font-bold text-red-400">
          Something Went Wrong
        </h3>
        <p className="text-gray-400 mt-2">
          We couldn't complete your purchase. Please try again.
        </p>
        <details className="mt-4 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
            Error Details
          </summary>
          <p className="text-xs text-red-400 mt-2 font-mono bg-gray-800 p-3 rounded-md border border-gray-700">
            {error}
          </p>
        </details>
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="w-full border border-gray-600 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ErrorStep; 