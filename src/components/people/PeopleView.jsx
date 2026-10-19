import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, Search, MessageSquare, Video, Mail, Briefcase, Filter, Sparkles, Phone, Building2, MapPin, ShieldCheck } from 'lucide-react';

export const PeopleView = () => {
  const { people, startOrGetDirectChat, setSelectedUserForProfile, setIsNewMeetingOpen } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  const branches = ['all', 'Sivakasi Branch 3.0', 'Sivakasi Branch 1.0', 'Srivilliputhur Branch 2.0'];
  const departments = ['all', ...Array.from(new Set(people.map(p => p.department).filter(Boolean)))];

  const filteredPeople = people.filter(p => {
    const matchesSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.department?.toLowerCase().includes(search.toLowerCase()) ||
      p.branch?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.toLowerCase().includes(search.toLowerCase()) ||
      p.empId?.toLowerCase().includes(search.toLowerCase());

    const matchesBrand = selectedBrand === 'all' || p.brands?.includes(selectedBrand);
    const matchesBranch = selectedBranch === 'all' || p.branch?.includes(selectedBranch);
    const matchesDept = selectedDept === 'all' || p.department?.toLowerCase() === selectedDept.toLowerCase();

    return matchesSearch && matchesBrand && matchesBranch && matchesDept;
  });

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

  const getRoleBadge = (role, staffRole) => {
    const r = staffRole || role;
    if (r === 'MD') return { label: 'MD', bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' };
    if (r === 'GM') return { label: 'GM', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' };
    if (r === 'HR_MANAGER') return { label: 'HR Manager', bg: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300' };
    if (r === 'MANAGER') return { label: 'Manager', bg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' };
    if (r === 'ADMIN') return { label: 'Admin / Incharge', bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' };
    return { label: 'Staff', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1E1E1E] min-w-0 overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between flex-none shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white">
              WeGrow Staff Directory
            </h1>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-semibold">
          {filteredPeople.length} {filteredPeople.length === 1 ? 'member' : 'members'} found
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="p-4 md:px-6 bg-white dark:bg-[#252525] border-b border-gray-200/80 dark:border-gray-800 space-y-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, title, branch, phone, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Brand Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold mr-1">Brand:</span>
            {['all', 'wegrow', 'skillcampus', 'bschool'].map(b => (
              <button
                type="button"
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                  selectedBrand === b
                    ? 'bg-[#0A2A8C] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-semibold mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-500" />
            Branch:
          </span>
          {branches.map(br => (
            <button
              type="button"
              key={br}
              onClick={() => setSelectedBranch(br)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedBranch === br
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {br === 'all' ? 'All Branches' : br}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {filteredPeople.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">
            No colleagues found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPeople.map(p => {
              const isCurrentUser = p._id === user?._id;
              const statusColor = getStatusColor(p.status);
              const badge = getRoleBadge(p.role, p.staffRole);

              return (
                <div
                  key={p._id}
                  className="bg-white dark:bg-[#282828] rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  {/* Top: Avatar & info */}
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-2xl text-white font-extrabold text-sm flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: p.color || '#5B5FC7' }}
                        >
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#282828]"
                          style={{ backgroundColor: statusColor }}
                          title={`Status: ${p.status}`}
                        ></span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {p.empId && (
                          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 font-bold">
                            {p.empId}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedUserForProfile(p)}
                      className="text-left font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                    >
                      {p.name} {isCurrentUser && <span className="text-[10px] text-blue-500 font-normal">(You)</span>}
                    </button>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate mt-0.5">{p.title}</div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{p.department}</div>

                    {/* Branch & Contact Info */}
                    {p.branch && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/60 px-2 py-1 rounded-lg">
                        <Building2 className="w-3 h-3 text-gray-400 flex-none" />
                        <span className="truncate font-medium">{p.branch}</span>
                      </div>
                    )}

                    {p.phone && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-1 px-2">
                        <Phone className="w-3 h-3 text-emerald-600 flex-none" />
                        <a href={`tel:${p.phone}`} className="hover:underline font-mono text-emerald-700 dark:text-emerald-400">
                          {p.phone}
                        </a>
                      </div>
                    )}

                    {/* Status note */}
                    {p.statusMessage && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl mt-2 line-clamp-1 border border-gray-100 dark:border-gray-700/50">
                        "{p.statusMessage}"
                      </p>
                    )}

                    {/* Brand Badges */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {p.brands?.map(b => (
                        <span
                          key={b}
                          className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Action buttons */}
                  {!isCurrentUser && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() => startOrGetDirectChat(p._id)}
                        className="flex-1 py-1.5 rounded-xl font-bold text-xs bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserForProfile(p)}
                        className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 transition-all"
                        title="View Full Profile"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
