import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Title */}
          <h1 className="text-8xl font-bold bg-gradient-to-r from-[#2DD4BF] via-[#EC4899] to-[#2DD4BF] bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-white mb-8">Page Not Found</h2>
          
          <p className="text-gray-400 mb-12">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#111111] border border-[#2DD4BF]/20 rounded-lg text-[#2DD4BF] hover:bg-[#2DD4BF]/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2DD4BF] to-[#EC4899] rounded-lg text-white hover:from-[#2DD4BF]/90 hover:to-[#EC4899]/90 transition-colors"
            >
              <Home className="w-5 h-5" />
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}