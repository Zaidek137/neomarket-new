import React from 'react';

interface Profile {
  id: number;
  name: string;
  image: string;
  nftCount: number;
}

interface SliderGalleryProps {
  direction: 'left' | 'right' | 'up';
  speed: number;
  className?: string;
}

export default function SliderGallery({ direction, speed, className = '' }: SliderGalleryProps) {
  const profiles: Profile[] = [
    { id: 1, name: "Neo_X", image: "https://ik.imagekit.io/q9x52ygvo/Layer%202.png?updatedAt=1731900403966", nftCount: 156 },
    { id: 2, name: "Cyber_Queen", image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=500&h=500&fit=crop", nftCount: 243 },
    { id: 3, name: "Digital_Samurai", image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=500&h=500&fit=crop", nftCount: 189 },
    { id: 4, name: "Neon_Ghost", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop", nftCount: 321 },
    { id: 5, name: "Matrix_Runner", image: "https://images.unsplash.com/photo-1621784563330-caee0b138a00?w=500&h=500&fit=crop", nftCount: 275 },
  ];

  // Triple the profiles for smoother infinite scroll
  const tripleProfiles = [...profiles, ...profiles, ...profiles];

  const isVertical = direction === 'up';
  const containerClass = isVertical ? 'flex flex-col' : 'flex';
  const itemClass = 'w-[280px] aspect-square'; // Fixed width to match container and forced square aspect ratio

  const getAnimationStyle = () => {
    const duration = `${speed}s`;
    const timing = 'linear infinite';
    let keyframeName;

    switch (direction) {
      case 'left':
        keyframeName = 'slideLeft';
        break;
      case 'right':
        keyframeName = 'slideRight';
        break;
      case 'up':
        keyframeName = 'slideUp';
        break;
      default:
        keyframeName = 'slideLeft';
    }

    return {
      animation: `${keyframeName} ${duration} ${timing}`,
    };
  };

  return (
    <div className={`relative overflow-hidden ${className} ${isVertical ? 'h-full' : 'py-4'}`}>
      <style>
        {`
          @keyframes slideLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          @keyframes slideRight {
            0% { transform: translateX(-33.33%); }
            100% { transform: translateX(0); }
          }
          @keyframes slideUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-33.33%); }
          }
        `}
      </style>

      {/* Fade Overlays */}
      {isVertical ? (
        <>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#111111] to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111111] to-transparent z-10" />
        </>
      ) : (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#111111] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#111111] to-transparent z-10" />
        </>
      )}

      {/* Scrolling Content */}
      <div 
        className={`${containerClass} gap-4`}
        style={getAnimationStyle()}
      >
        {tripleProfiles.map((profile, index) => (
          <div
            key={`${profile.id}-${index}`}
            className={`relative flex-none ${itemClass} group`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#2DD4BF]/20 to-[#EC4899]/20 rounded-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300" />
            <div className="relative h-full rounded-lg overflow-hidden backdrop-blur-sm border border-[#2DD4BF]/20 transform group-hover:scale-105 transition-transform duration-300">
              <img
                src={profile.image}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-[#2DD4BF] font-bold text-lg">{profile.name}</h3>
                  <p className="text-white text-sm">{profile.nftCount} NFTs</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}