import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Mail, MessageSquare, Video, Briefcase, Building, X, Shield, Calendar } from 'lucide-react';

export const ProfileModal = () => {
  const { selectedUserForProfile, setSelectedUserForProfile, startOrGetDirectChat, setIsNewMeetingOpen } = useApp();
  const { user } = useAuth();

  if (!selectedUserForProfile) return null;

  const p = selectedUserForProfile;
  const isMe = p._id === user?._id;

  const handleStartChat = () => {
    setSelectedUserForProfile(null);
    startOrGetDirectChat(p._id);
  };

  const handleScheduleMeet = () => {
    setSelectedUserForProfile(null);
    setIsNewMeetingOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#6BB700';
      case 'busy':
      case 'dnd': return '#C4314B';
      case 'away':
      case 'brb': return '#FFAA44';
      default: return '#8A8A8A';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
      <div className="bg-white dark:bg-[#282828] w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Banner */}
        <div
          className="h-24 relative p-4 flex justify-end"
          style={{
            background: `linear-gradient(135deg, ${p.color || '#5B5FC7'}, #0A2A8C)`
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedUserForProfile(null)}
            className="w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar */}
          <div className="-mt-12 mb-3 relative inline-block">
            <div
              className="w-20 h-20 rounded-2xl text-white font-black text-2xl flex items-center justify-center border-4 border-white dark:border-[#282828] shadow-md"
              style={{ backgroundColor: p.color || '#5B5FC7' }}
            >
              {p.name?.substring(0, 2).toUpperCase() || 'WX'}
            </div>
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white dark:border-[#282828]"
              style={{ backgroundColor: getStatusColor(p.status) }}
              title={`Status: ${p.status}`}
            ></span>
          </div>

          {/* User Details */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white truncate">
                {p.name}
              </h3>
              {p.empId && (
                <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-500 font-bold">
                  {p.empId}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">{p.title}</p>
            <p className="text-xs text-gray-400">{p.department}</p>
          </div>

          {/* Status Message */}
          {p.statusMessage && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs text-gray-700 dark:text-gray-300 italic border border-gray-100 dark:border-gray-700/60">
              "{p.statusMessage}"
            </div>
          )}

          {/* Contact Details */}
          <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gray-400 flex-none" />
              <span className="truncate">{p.email}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-gray-400 flex-none" />
              <span>{p.department || 'General Team'}</span>
            </div>
          </div>

          {/* Brand Access Badges */}
          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Brand Access</div>
            <div className="flex flex-wrap gap-1.5">
              {p.brands?.map(b => (
                <span
                  key={b}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          {!isMe && (
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleStartChat}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-[#5B5FC7] hover:bg-[#4F52B2] text-white flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button
                type="button"
                onClick={handleScheduleMeet}
                className="py-2.5 px-3 rounded-xl font-bold text-xs border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-1.5 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Meet</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
