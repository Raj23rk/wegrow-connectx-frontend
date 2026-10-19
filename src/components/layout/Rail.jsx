import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, MessageSquare, Users2, Calendar, FolderGit2, User, ShieldCheck } from 'lucide-react';

export const Rail = () => {
  const { currentApp, setCurrentApp, unreadActivitiesCount, chats } = useApp();
  const { user } = useAuth();

  // Calculate unread chat messages
  const unreadChatsCount = chats.reduce((acc, c) => {
    return acc + (c.unreadCounts?.[user?._id] || 0);
  }, 0);

  const railItems = [
    { id: 'activity', label: 'Activity', icon: Bell, badge: unreadActivitiesCount },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadChatsCount },
    { id: 'teams', label: 'Teams', icon: Users2, badge: 0 },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: 0 },
    { id: 'files', label: 'Files', icon: FolderGit2, badge: 0 },
    { id: 'people', label: 'People', icon: User, badge: 0 },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: ShieldCheck, badge: 0 }] : [])
  ];

  return (
    <aside className="w-16 md:w-[68px] bg-[#EBEBEB] dark:bg-[#181818] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col items-center py-2 z-20 flex-none select-none">
      <div className="w-full flex flex-col items-center gap-1">
        {railItems.map(item => {
          const Icon = item.icon;
          const isActive = currentApp === item.id;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setCurrentApp(item.id)}
              className={`relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group ${
                isActive
                  ? 'text-[#5B5FC7] dark:text-[#9EA2FF] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
              }`}
            >
              {/* Left active indicator pill */}
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1 bg-[#5B5FC7] dark:bg-[#7F85F5] rounded-r-md"></span>
              )}

              {/* Icon with badge */}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#C4314B] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-[#EBEBEB] dark:border-[#181818]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
