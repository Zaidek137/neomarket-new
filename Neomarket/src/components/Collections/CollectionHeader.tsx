import React from 'react';

export default function CollectionHeader() {
  return (
    <div className="w-full">
      {/* Full-width Banner Image */}
      <div className="relative h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px] xl:h-[320px] w-full overflow-hidden">
        <img
          src="https://zrolrdnymkkdcyksuctq.supabase.co/storage/v1/object/public/Gallery/Homepage%20Images/Collections%20Banner.png"
          alt="Collections"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.innerHTML = '<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Collections</h1>';
            fallback.className = 'absolute inset-0 flex items-center justify-center bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900';
            target.parentNode?.appendChild(fallback);
          }}
        />
      </div>

      {/* Description Text Below Image - With proper container */}
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        <div className="text-center">
          <p className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
            Discover unique digital collections from verified creators and emerging artists in the NeoMarket ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}
