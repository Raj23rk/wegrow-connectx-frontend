import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Search, X, Check } from 'lucide-react';

export const NewChatModal = () => {
  const { isNewChatOpen, setIsNewChatOpen, people, startOrGetDirectChat } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  if (!isNewChatOpen) return null;

  const filteredPeople = people.filter(p =>
    p._id !== user?._id &&
    (!search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (person) => {
    setIsNewChatOpen(false);
    startOrGetDirectChat(person._id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
      <div className="bg-white dark:bg-[#282828] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[70vh]">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white">Start a Conversation</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsNewChatOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search colleague by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* People List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredPeople.map(p => (
            <button
              type="button"
              key={p._id}
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 text-left transition-all"
            >
              <div
                className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-none shadow-xs"
                style={{ backgroundColor: p.color || '#5B5FC7' }}
              >
                {p.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-gray-900 dark:text-white truncate">{p.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{p.title} • {p.department}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
