import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Smile } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Frequently Used',
    emojis: ['👍', '❤️', '🔥', '🎉', '🚀', '👏', '🙌', '💯', '✨', '💡', '✅', '🙏']
  },
  {
    name: 'Smileys & Emotion',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤩', '🥳', '😏', '🤔', '🤫', '😴', '🤯']
  },
  {
    name: 'Gestures & People',
    emojis: ['👋', '👌', '✌️', '🤞', '🤙', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪', '👀', '🧑‍💻', '🙋‍♂️', '🙋‍♀️', '🙇']
  },
  {
    name: 'Work & Collaboration',
    emojis: ['💻', '📱', '⌨️', '🖥️', '📊', '📈', '📉', '📁', '📂', '📑', '📝', '📌', '📎', '📅', '📆', '🗓️', '⏰', '⏱️', '🎯', '🏆', '🥇', '⚡', '🔔', '📣']
  },
  {
    name: 'Symbols & Objects',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '⭐', '🌟', '✨', '🔥', '💥', '☀️', '☕', '🍕', '🎉', '🎊', '🎈', '🎁']
  }
];

export const EmojiPicker = ({ onSelect, onClose, align = 'right' }) => {
  const [search, setSearch] = useState('');
  const pickerRef = useRef(null);

  // Close on escape or outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Filter emojis
  const filteredCategories = search.trim()
    ? [
        {
          name: 'Search Results',
          emojis: EMOJI_CATEGORIES.flatMap(c => c.emojis).filter((emoji, idx, self) => self.indexOf(emoji) === idx)
        }
      ]
    : EMOJI_CATEGORIES;

  return (
    <div
      ref={pickerRef}
      className={`absolute bottom-full mb-2 ${
        align === 'left' ? 'left-0' : 'right-0'
      } w-72 sm:w-80 bg-white dark:bg-[#282828] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden flex flex-col animate-pop`}
      style={{ maxHeight: '350px' }}
    >
      {/* Header & Search */}
      <div className="p-2.5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/70 dark:bg-[#222222] flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search emojis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs rounded-xl bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Emoji Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 max-h-64">
        {filteredCategories.map((cat) => (
          <div key={cat.name}>
            <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-1.5">
              {cat.name}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {cat.emojis.map((emoji, index) => (
                <button
                  type="button"
                  key={`${cat.name}-${emoji}-${index}`}
                  onClick={() => {
                    onSelect(emoji);
                    onClose?.();
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700/70 active:scale-125 transition-all cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
