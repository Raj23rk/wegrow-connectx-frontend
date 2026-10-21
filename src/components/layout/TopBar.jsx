import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Search, Sun, Moon, LogOut, Check, ChevronDown, User, ShieldCheck } from 'lucide-react';

import logoImg from '../../images/wegrow&Bschool.webp';

const STATUS_OPTIONS = [
  { id: 'available', label: 'Available', color: '#6BB700' },
  { id: 'busy', label: 'Busy', color: '#C4314B' },
  { id: 'dnd', label: 'Do not disturb', color: '#C4314B' },
  { id: 'brb', label: 'Be right back', color: '#FFAA44' },
  { id: 'away', label: 'Appear away', color: '#FFAA44' },
  { id: 'offline', label: 'Appear offline', color: '#8A8A8A' }
];

export const TopBar = () => {
  const { user, logout, updateStatus } = useAuth();
  const { theme, toggleTheme, currentBrand, setIsSearchOpen } = useApp();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState(user?.statusMessage || '');
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusSelect = (statusId) => {
    updateStatus(statusId, customMsg);
  };

  const handleSaveStatusMsg = (e) => {
    e.preventDefault();
    updateStatus(user.status || 'available', customMsg);
    setIsProfileMenuOpen(false);
  };

  const currentStatusObj = STATUS_OPTIONS.find(s => s.id === user?.status) || STATUS_OPTIONS[0];

  const getInitials = (name) => {
    if (!name) return 'WX';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="h-12 bg-white dark:bg-[#181818] border-b border-gray-200 dark:border-[#2E2E2E] flex items-center justify-between px-2.5 sm:px-4 z-30 flex-none select-none">
      {/* Brand & Logo - Replaced text with image logo */}
      <div className="flex items-center gap-2 sm:gap-3 flex-none">
        <div className="flex items-center">
          <img
            src={logoImg}
            alt="WeGrow"
            className="h-7 sm:h-8 max-w-[130px] sm:max-w-[160px] object-contain rounded-md bg-white dark:bg-white/95 px-1.5 py-0.5 shadow-2xs"
          />
        </div>

        {/* Current brand badge */}
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                currentBrand === 'wegrow' ? '#2F7D4F' : currentBrand === 'skillcampus' ? '#3A47C4' : '#8E2C3C'
            }}
          ></span>
          {currentBrand}
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl mx-2 sm:mx-4">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#282828] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <Search className="w-3.5 h-3.5 flex-none" />
            <span className="truncate hidden sm:inline">Search messages, files, people, channels...</span>
            <span className="truncate sm:hidden">Search...</span>
          </div>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Theme + Profile */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <div className="relative">
              <div
                className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs"
                style={{ backgroundColor: user?.color || '#5B5FC7' }}
              >
                {getInitials(user?.name)}
              </div>
              {/* Presence dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#181818]"
                style={{ backgroundColor: currentStatusObj.color }}
              ></span>
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 max-w-[100px] truncate hidden md:inline-block">
              {user?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Profile Popover Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-10 w-72 bg-white dark:bg-[#282828] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 px-3 z-50 text-xs text-gray-700 dark:text-gray-200 animate-pop">
              {/* User overview */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm flex-none"
                  style={{ backgroundColor: user?.color || '#5B5FC7' }}
                >
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                    {user?.name}
                    {user?.role === 'admin' && (
                      <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-[9px] font-extrabold uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.title} • {user?.department}</div>
                </div>
              </div>

              {/* Status Message Editor */}
              <form onSubmit={handleSaveStatusMsg} className="py-2.5 border-b border-gray-100 dark:border-gray-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  Status Message
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="What's your status today?"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Set
                  </button>
                </div>
              </form>

              {/* Presence status options */}
              <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  Presence Status
                </div>
                <div className="space-y-0.5">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => handleStatusSelect(s.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all ${
                        user?.status === s.id ? 'font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-none" style={{ backgroundColor: s.color }}></span>
                        <span>{s.label}</span>
                      </div>
                      {user?.status === s.id && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign out */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold transition-all text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of ConnectX</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
