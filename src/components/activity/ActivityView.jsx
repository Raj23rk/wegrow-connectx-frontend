import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, MessageSquare, Megaphone, Calendar, CheckCheck, Clock } from 'lucide-react';

export const ActivityView = () => {
  const { activities, setCurrentApp, setCurrentChannelId, setCurrentBrand } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = activities.filter(a => {
    if (filter === 'all') return true;
    return a.type === filter;
  });

  const handleActivityClick = (act) => {
    if (act.link?.app === 'teams' && act.link?.targetId) {
      setCurrentChannelId(act.link.targetId);
      const b = act.link.targetId.split('-')[0];
      if (b) setCurrentBrand(b);
      setCurrentApp('teams');
    } else if (act.link?.app === 'calendar') {
      setCurrentApp('calendar');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'reply':
      case 'mention':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-orange-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1E1E1E] min-w-0 overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between flex-none shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white">
              Activity & Notifications Feed
            </h1>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          {['all', 'announcement', 'reply', 'meeting'].map(t => (
            <button
              type="button"
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-xl capitalize transition-all ${
                filter === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500 text-xs">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
            No activities to display under this filter.
          </div>
        ) : (
          filtered.map(act => (
            <div
              key={act._id}
              onClick={() => handleActivityClick(act)}
              className="p-4 rounded-2xl bg-white dark:bg-[#282828] border border-gray-200/80 dark:border-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
            >
              <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 flex-none group-hover:scale-105 transition-all">
                {getIcon(act.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-extrabold text-xs md:text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {act.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 flex-none">
                    <Clock className="w-3 h-3" />
                    {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {act.body && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {act.body}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
