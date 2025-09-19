import React from 'react';
import { X } from 'lucide-react';

type TraitModalProps = {
  metadata: any;
  onClose: () => void;
};

const TraitModal: React.FC<TraitModalProps> = ({ metadata, onClose }) => {
  if (!metadata) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center z-50 pt-28 pb-8"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black border border-cyan-600/50 rounded-2xl shadow-2xl shadow-cyan-500/20 p-8 max-w-lg w-full m-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white truncate">{metadata.name}</h2>
            {metadata.description && (
                <p className="text-gray-400 mt-2 max-w-md">{metadata.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-cyan-300 border-b border-cyan-800 pb-2">Traits</h3>
          {metadata.attributes && Array.isArray(metadata.attributes) && metadata.attributes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {metadata.attributes.map((attr: any, index: number) => (
                <div key={index} className="bg-cyan-900/40 p-3 rounded-lg border border-cyan-800/50">
                  <div className="text-cyan-200 text-sm font-semibold capitalize">{attr.trait_type}</div>
                  <div className="text-white text-base truncate">{attr.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">This NFT has no traits.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraitModal; 