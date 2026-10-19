import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Hash, Megaphone, X, Plus } from 'lucide-react';

export const NewChannelModal = () => {
  const { isNewChannelOpen, setIsNewChannelOpen, createChannel, brands } = useApp();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [brandId, setBrandId] = useState('wegrow');
  const [isAnnounce, setIsAnnounce] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isNewChannelOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
      await createChannel({
        brandId,
        name: cleanName,
        topic: topic.trim(),
        isAnnounce
      });
      setIsNewChannelOpen(false);
      setName('');
      setTopic('');
      setIsAnnounce(false);
    } catch (err) {
      alert(err.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
      <div className="bg-white dark:bg-[#282828] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Hash className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Create New Channel</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsNewChannelOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Target Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white font-bold"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.short})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Channel Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
              <input
                type="text"
                required
                placeholder="e.g. project-apollo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Topic / Purpose (Optional)</label>
            <input
              type="text"
              placeholder="What is this channel about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700/60">
            <input
              type="checkbox"
              id="isAnnounce"
              checked={isAnnounce}
              onChange={(e) => setIsAnnounce(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isAnnounce" className="cursor-pointer">
              <span className="font-bold text-gray-800 dark:text-gray-200 block">Announcement Channel</span>
              <span className="text-[11px] text-gray-400">Highlights official broadcasts with special megaphone badge</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsNewChannelOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold transition-all shadow-sm"
            >
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
