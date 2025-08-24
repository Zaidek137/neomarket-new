import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle } from 'lucide-react';
import { votingService, ProposalCategory } from '../services/supabase';
import { useActiveAccount } from 'thirdweb/react';
import { isAdminWallet } from '../config/admin';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalCreated: () => void;
}

export default function CreateProposalModal({ isOpen, onClose, onProposalCreated }: CreateProposalModalProps) {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'music' as ProposalCategory,
    votes_required: 100,
    end_date: '',
    end_time: '23:59',
    image_url: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories: { value: ProposalCategory; label: string }[] = [
    { value: 'music', label: 'Music & Music Videos' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'city_voting', label: 'City Voting' },
    { value: 'creative_content', label: 'Creative Content' }
  ];

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.address) {
      setError('Please connect your wallet');
      return;
    }

    if (!isAdminWallet(account.address)) {
      setError('Only admins can create proposals');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combine date and time
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      
      await votingService.createProposal({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        votes_required: formData.votes_required,
        created_by: account.address,
        start_date: new Date().toISOString(),
        end_date: endDateTime.toISOString(),
        image_url: formData.image_url || null
      });

      onProposalCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'music',
        votes_required: 100,
        end_date: '',
        end_time: '23:59',
        image_url: ''
      });
      setImagePreview(null);
    } catch (err) {
      console.error('Error creating proposal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg sm:rounded-xl lg:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold font-tech text-white">Create New Proposal</h2>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X size={18} className="sm:w-5 sm:h-5 text-slate-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Proposal Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base"
                placeholder="Enter a clear, concise title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none text-sm sm:text-base"
                placeholder="Provide detailed information about this proposal"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Proposal Image (Optional)
              </label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4 relative">
                  <img 
                    src={imagePreview} 
                    alt="Proposal preview" 
                    className="w-full h-48 object-cover rounded-lg border border-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image_url: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Image URL Input */}
              <div>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter image URL (https://...)"
                />
              </div>
              
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                Add an image URL to make your proposal more engaging. Supports JPG, PNG, GIF formats.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProposalCategory })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Votes Required */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Votes Required to Pass
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.votes_required}
                onChange={(e) => setFormData({ ...formData, votes_required: parseInt(e.target.value) || 1 })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base"
              />
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                Minimum number of "For" votes needed for the proposal to pass
              </p>
            </div>

            {/* End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="sm:w-5 sm:h-5" />
                    Create Proposal
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
