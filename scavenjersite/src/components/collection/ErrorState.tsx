import React from 'react';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
        {message}
      </div>
    </div>
  );
}