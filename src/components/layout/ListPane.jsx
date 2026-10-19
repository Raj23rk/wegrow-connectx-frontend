import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Hash, Megaphone, Plus, ChevronDown, ChevronRight, MessageSquare, Check, Filter } from 'lucide-react';

export const ListPane = () => {
  const {
    currentApp,
    brands,
    channels,
    currentBrand,
    setCurrentBrand,
    currentChannelId,
    setCurrentChannelId,
    chats,
    currentChatId,
    setCurrentChatId,
    activities,
    setIsNewChannelOpen,
    setIsNewChatOpen
  } = useApp();
  const { user } = useAuth();

  const [expandedBrands, setExpandedBrands] = useState({
    wegrow: true,
    skillcampus: true,
    bschool: true
  });

  const [activityFilter, setActivityFilter] = useState('all');

  const toggleBrandAccordion = (bId) => {
    setExpandedBrands(prev => ({
      ...prev,
      [bId]: !prev[bId]
    }));
  };

  const getChatPartner = (chat) => {
    if (chat.type === 'group') return { name: chat.name || 'Group Chat', status: 'available', color: '#5B5FC7' };
    const partner = chat.participants?.find(p => p._id !== user?._id);
    return partner || { name: 'Direct Chat', status: 'available', color: '#5B5FC7' };
  };

  const formatShortTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If calendar, files, people, or admin, ListPane is hidden on wide view or gives way
  if (['calendar', 'files', 'people', 'admin'].includes(currentApp)) {
    return null;
  }

  return (
    <aside className="w-72 md:w-80 bg-[#FAFAFA] dark:bg-[#242424] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col h-full z-10 flex-none select-none">
      {/* ================= TEAMS LIST ================= */}
      {currentApp === 'teams' && (
        <>
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 flex-none">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">Teams & Channels</h2>
            <button
              type="button"
              onClick={() => setIsNewChannelOpen(true)}
              title="Create Channel"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {brands.map(brand => {
              const brandChannels = channels.filter(c => c.brandId === brand.id);
              const isExpanded = !!expandedBrands[brand.id];

              return (
                <div key={brand.id} className="space-y-0.5">
                  {/* Brand Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleBrandAccordion(brand.id)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left hover:bg-gray-200/50 dark:hover:bg-gray-700/40 transition-all group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-extrabold flex-none shadow-xs"
                        style={{ backgroundColor: brand.color }}
                      >
                        {brand.short}
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-gray-950 dark:group-hover:text-white">
                        {brand.name}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>

                  {/* Channels under Brand */}
                  {isExpanded && (
                    <div className="pl-3 space-y-0.5">
                      {brandChannels.map(ch => {
                        const isSelected = currentChannelId === ch.id;

                        return (
                          <button
                            type="button"
                            key={ch.id}
                            onClick={() => {
                              setCurrentChannelId(ch.id);
                              setCurrentBrand(ch.brandId);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-white dark:bg-[#323232] text-gray-900 dark:text-white font-bold shadow-xs border-l-3 border-[#5B5FC7]'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/40 dark:hover:bg-gray-800/40 font-medium'
                            }`}
                          >
                            {ch.isAnnounce ? (
                              <Megaphone className="w-3.5 h-3.5 text-orange-500 flex-none" />
                            ) : (
                              <Hash className="w-3.5 h-3.5 text-gray-400 flex-none" />
                            )}
                            <span className="truncate flex-1">{ch.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= CHAT LIST ================= */}
      {currentApp === 'chat' && (
        <>
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 flex-none">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">Direct Chats</h2>
            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              title="New Chat"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-400 dark:text-gray-500 text-xs">
                No active conversations yet. Click + to start a direct message!
              </div>
            ) : (
              chats.map(chat => {
                const partner = getChatPartner(chat);
                const isSelected = currentChatId === chat._id;
                const statusColor = partner.status === 'busy' || partner.status === 'dnd' ? '#C4314B' : partner.status === 'away' || partner.status === 'brb' ? '#FFAA44' : '#6BB700';

                return (
                  <button
                    type="button"
                    key={chat._id}
                    onClick={() => setCurrentChatId(chat._id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-[#323232] shadow-xs'
                        : 'hover:bg-gray-200/40 dark:hover:bg-gray-800/40'
                    }`}
                  >
                    {/* Partner avatar with status dot */}
                    <div className="relative flex-none">
                      <div
                        className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: partner.color || '#5B5FC7' }}
                      >
                        {partner.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#FAFAFA] dark:border-[#242424]"
                        style={{ backgroundColor: statusColor }}
                      ></span>
                    </div>

                    {/* Chat snippet */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {partner.name}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-none">
                          {formatShortTime(chat.lastMessage?.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {chat.lastMessage?.text || 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ================= ACTIVITY LIST ================= */}
      {currentApp === 'activity' && (
        <>
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 flex-none">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">Notifications</h2>
            <div className="flex gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActivityFilter('all')}
                className={`px-2 py-0.5 rounded-full font-bold ${
                  activityFilter === 'all'
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActivityFilter('reply')}
                className={`px-2 py-0.5 rounded-full font-bold ${
                  activityFilter === 'reply'
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Replies
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activities.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-400 dark:text-gray-500 text-xs">
                You're all caught up! No recent activity.
              </div>
            ) : (
              activities
                .filter(a => activityFilter === 'all' || a.type === activityFilter)
                .map(item => (
                  <div
                    key={item._id}
                    className="p-3 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-100 dark:border-gray-700/60 shadow-xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-none"
                        style={{ backgroundColor: item.actor?.color || '#5B5FC7' }}
                      >
                        {item.actor?.name?.substring(0, 2).toUpperCase() || 'WX'}
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {item.title}
                      </span>
                    </div>
                    {item.body && (
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2">
                        {item.body}
                      </p>
                    )}
                    <div className="text-[10px] text-gray-400 text-right">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
            )}
          </div>
        </>
      )}
    </aside>
  );
};
