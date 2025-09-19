import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the profile data
    // For now, we'll just close the modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/90 border border-cyan-500/20 rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6">
          Create Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-cyan-400 text-sm mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/60 border border-cyan-500/30 rounded px-4 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-cyan-400 text-sm mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-black/60 border border-cyan-500/30 rounded px-4 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 transition-colors h-24 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}