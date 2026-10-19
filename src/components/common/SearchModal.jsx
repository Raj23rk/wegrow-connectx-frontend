import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Hash, MessageSquare, User, FolderGit2, X, ArrowRight } from 'lucide-react';

export const SearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    channels,
    people,
    files,
    channelMessages,
    setCurrentApp,
    setCurrentChannelId,
    setCurrentBrand,
    startOrGetDirectChat,
    setSelectedUserForProfile
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Global keydown listener for Ctrl+K / Cmd+K and Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedChannels = q ? channels.filter(c => c.name?.toLowerCase().includes(q) || c.topic?.toLowerCase().includes(q)) : [];
  const matchedPeople = q ? people.filter(p => p.name?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q) || p.department?.toLowerCase().includes(q)) : [];
  const matchedFiles = q ? files.filter(f => f.name?.toLowerCase().includes(q)) : [];
  const matchedMessages = q ? channelMessages.filter(m => m.text?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q)) : [];

  const handleSelectChannel = (ch) => {
    setCurrentChannelId(ch.id);
    setCurrentBrand(ch.brandId);
    setCurrentApp('teams');
    setIsSearchOpen(false);
  };

  const handleSelectPerson = (p) => {
    setSelectedUserForProfile(p);
    setIsSearchOpen(false);
  };

  const handleSelectFile = () => {
    setCurrentApp('files');
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-pop">
      <div className="bg-white dark:bg-[#282828] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search channels, people, files, messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm md:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q ? (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">
              Type to search across WeGrow, SkillCampus and BSchool channels, people, files and messages.
            </div>
          ) : (
            <>
              {/* Channels results */}
              {matchedChannels.length > 0 && (
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Channels</div>
                  <div className="space-y-1">
                    {matchedChannels.map(c => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleSelectChannel(c)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 text-left text-xs transition-all group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Hash className="w-4 h-4 text-gray-400 flex-none" />
                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{c.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-mono">({c.brandId})</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* People results */}
              {matchedPeople.length > 0 && (
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">People</div>
                  <div className="space-y-1">
                    {matchedPeople.map(p => (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => handleSelectPerson(p)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 text-left text-xs transition-all group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-none"
                            style={{ backgroundColor: p.color || '#5B5FC7' }}
                          >
                            {p.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{p.name}</span>
                          <span className="text-[11px] text-gray-400 truncate">({p.title} • {p.department})</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Files results */}
              {matchedFiles.length > 0 && (
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Files</div>
                  <div className="space-y-1">
                    {matchedFiles.map(f => (
                      <button
                        type="button"
                        key={f._id}
                        onClick={handleSelectFile}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 text-left text-xs transition-all group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FolderGit2 className="w-4 h-4 text-purple-500 flex-none" />
                          <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{f.name}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {matchedChannels.length === 0 && matchedPeople.length === 0 && matchedFiles.length === 0 && matchedMessages.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">
                  No matches found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
