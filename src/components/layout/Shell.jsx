import React from 'react';
import { useApp } from '../../context/AppContext';
import { TopBar } from './TopBar';
import { Rail } from './Rail';
import { ListPane } from './ListPane';
import { ChannelView } from '../teams/ChannelView';
import { ChatView } from '../chat/ChatView';
import { CalendarView } from '../calendar/CalendarView';
import { FilesView } from '../files/FilesView';
import { PeopleView } from '../people/PeopleView';
import { AdminView } from '../admin/AdminView';
import { ActivityView } from '../activity/ActivityView';

import { SearchModal } from '../common/SearchModal';
import { ProfileModal } from '../common/ProfileModal';
import { NewMeetingModal } from '../common/NewMeetingModal';
import { NewChannelModal } from '../common/NewChannelModal';
import { NewChatModal } from '../common/NewChatModal';

export const Shell = () => {
  const { currentApp } = useApp();

  const renderMainContent = () => {
    switch (currentApp) {
      case 'teams':
        return <ChannelView />;
      case 'chat':
        return <ChatView />;
      case 'calendar':
        return <CalendarView />;
      case 'files':
        return <FilesView />;
      case 'people':
        return <PeopleView />;
      case 'admin':
        return <AdminView />;
      case 'activity':
        return <ActivityView />;
      default:
        return <ChannelView />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gray-100 dark:bg-[#1F1F1F]">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Navigation Rail */}
        <Rail />

        {/* List Pane (Teams / Channels / Chats list) */}
        <ListPane />

        {/* Primary Content View */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {renderMainContent()}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <SearchModal />
      <ProfileModal />
      <NewMeetingModal />
      <NewChannelModal />
      <NewChatModal />
    </div>
  );
};
