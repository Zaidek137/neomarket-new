import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold text-slate-700">404</div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-slate-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/explore')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            <Home size={18} />
            Go Home
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-3">Looking for something specific?</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search collections, Ekos..."
                className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/explore');
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
