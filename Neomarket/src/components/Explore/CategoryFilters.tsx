import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface CategoryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  'All',
  'Collections',
  'Auctions',
  'Listed'
];

export default function CategoryFilters({
  activeCategory,
  onCategoryChange
}: CategoryFiltersProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    if (category === 'Auctions') {
      navigate('/auctions');
    } else if (category === 'Collections') {
      navigate('/collections');
    } else {
      onCategoryChange(category);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-6 py-3 sm:py-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap",
              "hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
              "backdrop-blur-sm border",
              activeCategory === category
                ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/30 shadow-lg shadow-cyan-500/20"
                : "bg-slate-800/50 text-slate-400 border-slate-600/50 hover:text-white hover:border-slate-500/50"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
