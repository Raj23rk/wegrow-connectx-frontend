import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();

  // Navigation & View state
  const [currentApp, setCurrentApp] = useState('teams'); // 'teams' | 'chat' | 'activity' | 'calendar' | 'files' | 'people' | 'admin'
  const [currentBrand, setCurrentBrand] = useState('wegrow');
  const [currentChannelId, setCurrentChannelId] = useState('wegrow-announcements');
  const [currentChatId, setCurrentChatId] = useState(null);

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('connectx_theme') || 'light');

  // Data states
  const [brands, setBrands] = useState([]);
  const [channels, setChannels] = useState([]);
  const [channelMessages, setChannelMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [files, setFiles] = useState([]);
  const [people, setPeople] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadActivitiesCount, setUnreadActivitiesCount] = useState(0);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);

  // Live indicators
  const [typingMap, setTypingMap] = useState({}); // key: contextId -> Set of usernames

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('connectx_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Load initial global data once authenticated
  const loadInitialData = useCallback(async () => {
    if (!user) return;
    try {
      const [brandsRes, channelsRes, chatsRes, peopleRes, activitiesRes] = await Promise.all([
        api.getBrands(),
        api.getChannels(),
        api.getChats(),
        api.getUsers(),
        api.getActivities()
      ]);

      if (brandsRes.success) setBrands(brandsRes.brands || []);
      if (channelsRes.success) setChannels(channelsRes.channels || []);
      if (chatsRes.success) {
        setChats(chatsRes.chats || []);
        if (chatsRes.chats && chatsRes.chats.length > 0 && !currentChatId) {
          setCurrentChatId(chatsRes.chats[0]._id);
        }
      }
      if (peopleRes.success) setPeople(peopleRes.users || []);
      if (activitiesRes.success) {
        setActivities(activitiesRes.activities || []);
        setUnreadActivitiesCount(activitiesRes.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[App] Failed to load some initial data:', err.message);
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load channel messages when currentChannelId changes
  const loadChannelMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    try {
      const res = await api.getChannelMessages(channelId);
      if (res.success) {
        setChannelMessages(res.messages || []);
      }
    } catch (err) {
      console.warn(`[App] Failed to load messages for channel ${channelId}:`, err.message);
    }
  }, []);

  useEffect(() => {
    if (currentChannelId) {
      loadChannelMessages(currentChannelId);
      socketService.joinChannel(currentChannelId);
      return () => {
        socketService.leaveChannel(currentChannelId);
      };
    }
  }, [currentChannelId, loadChannelMessages]);

  // Load chat messages when currentChatId changes
  const loadChatMessages = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      const res = await api.getChatMessages(chatId);
      if (res.success) {
        setChatMessages(res.messages || []);
      }
    } catch (err) {
      console.warn(`[App] Failed to load chat messages for ${chatId}:`, err.message);
    }
  }, []);

  useEffect(() => {
    if (currentChatId) {
      loadChatMessages(currentChatId);
      socketService.joinChat(currentChatId);
      return () => {
        socketService.leaveChat(currentChatId);
      };
    }
  }, [currentChatId, loadChatMessages]);

  // Load calendar events
  const loadCalendarEvents = useCallback(async () => {
    try {
      const res = await api.getCalendarEvents();
      if (res.success) {
        setEvents(res.events || []);
      }
    } catch (err) {
      console.warn('[App] Failed to load calendar events:', err.message);
    }
  }, []);

  useEffect(() => {
    if (currentApp === 'calendar') {
      loadCalendarEvents();
    }
  }, [currentApp, loadCalendarEvents]);

  // Load files
  const loadFiles = useCallback(async () => {
    try {
      const res = await api.getFiles();
      if (res.success) {
        setFiles(res.files || []);
      }
    } catch (err) {
      console.warn('[App] Failed to load files:', err.message);
    }
  }, []);

  useEffect(() => {
    if (currentApp === 'files') {
      loadFiles();
    }
  }, [currentApp, loadFiles]);

  // Real-time socket bindings
  useEffect(() => {
    if (!user) return;

    // New channel message
    const handleNewMessage = (newMsg) => {
      if (newMsg.channelId === currentChannelId) {
        if (newMsg.parentMessageId) {
          // Thread reply
          setChannelMessages(prev => prev.map(m => {
            if (m._id === newMsg.parentMessageId) {
              const currentReplies = m.replies || [];
              return {
                ...m,
                replyCount: (m.replyCount || 0) + 1,
                lastReplyAt: newMsg.createdAt,
                replies: [...currentReplies, newMsg]
              };
            }
            return m;
          }));
        } else {
          // New parent post
          setChannelMessages(prev => [...prev, { ...newMsg, replies: [] }]);
        }
      }
    };

    // Updated channel message (e.g. reaction)
    const handleUpdatedMessage = (updatedMsg) => {
      setChannelMessages(prev => prev.map(m => {
        if (m._id === updatedMsg._id) {
          return { ...updatedMsg, replies: m.replies || [] };
        }
        if (m.replies && m.replies.some(r => r._id === updatedMsg._id)) {
          return {
            ...m,
            replies: m.replies.map(r => r._id === updatedMsg._id ? updatedMsg : r)
          };
        }
        return m;
      }));
    };

    // Deleted message
    const handleDeletedMessage = ({ messageId }) => {
      setChannelMessages(prev => prev.filter(m => m._id !== messageId));
    };

    // New direct chat message
    const handleNewChatMessage = ({ chatId, message }) => {
      if (chatId === currentChatId) {
        setChatMessages(prev => [...prev, message]);
      }
      setChats(prev => prev.map(c => {
        if (c._id === chatId) {
          return {
            ...c,
            lastMessage: {
              text: message.text,
              sender: message.sender,
              timestamp: message.createdAt
            }
          };
        }
        return c;
      }));
    };

    // User presence update
    const handleUserPresence = ({ userId, status, statusMessage }) => {
      setPeople(prev => prev.map(p => {
        if (p._id === userId) {
          return {
            ...p,
            status: status || p.status,
            statusMessage: statusMessage !== undefined ? statusMessage : p.statusMessage
          };
        }
        return p;
      }));
    };

    // Typing start
    const handleTypingStart = ({ contextId, user: typingUser }) => {
      if (!typingUser || typingUser._id === user._id) return;
      setTypingMap(prev => {
        const currentSet = new Set(prev[contextId] || []);
        currentSet.add(typingUser.name);
        return { ...prev, [contextId]: currentSet };
      });
    };

    // Typing stop
    const handleTypingStop = ({ contextId, user: typingUser }) => {
      if (!typingUser || typingUser._id === user._id) return;
      setTypingMap(prev => {
        const currentSet = new Set(prev[contextId] || []);
        currentSet.delete(typingUser.name);
        return { ...prev, [contextId]: currentSet };
      });
    };

    // Calendar events
    const handleCalendarEventNew = (newEvent) => {
      setEvents(prev => [...prev, newEvent]);
    };
    const handleCalendarEventUpdated = (updatedEvent) => {
      setEvents(prev => prev.map(e => e._id === updatedEvent._id ? updatedEvent : e));
    };
    const handleCalendarEventDeleted = ({ eventId }) => {
      setEvents(prev => prev.filter(e => e._id !== eventId));
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('message:updated', handleUpdatedMessage);
    socketService.on('message:deleted', handleDeletedMessage);
    socketService.on('chat:message:new', handleNewChatMessage);
    socketService.on('user:presence', handleUserPresence);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('calendar:event:new', handleCalendarEventNew);
    socketService.on('calendar:event:updated', handleCalendarEventUpdated);
    socketService.on('calendar:event:deleted', handleCalendarEventDeleted);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:updated', handleUpdatedMessage);
      socketService.off('message:deleted', handleDeletedMessage);
      socketService.off('chat:message:new', handleNewChatMessage);
      socketService.off('user:presence', handleUserPresence);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('calendar:event:new', handleCalendarEventNew);
      socketService.off('calendar:event:updated', handleCalendarEventUpdated);
      socketService.off('calendar:event:deleted', handleCalendarEventDeleted);
    };
  }, [user, currentChannelId, currentChatId]);

  // Actions
  const sendChannelMessage = async (msgData) => {
    const res = await api.sendMessage({
      ...msgData,
      channelId: currentChannelId
    });
    if (res.success && res.message) {
      if (res.message.parentMessageId) {
        setChannelMessages(prev => prev.map(m => {
          if (m._id === res.message.parentMessageId) {
            return {
              ...m,
              replyCount: (m.replyCount || 0) + 1,
              replies: [...(m.replies || []), res.message]
            };
          }
          return m;
        }));
      } else {
        setChannelMessages(prev => {
          if (prev.some(m => m._id === res.message._id)) return prev;
          return [...prev, { ...res.message, replies: [] }];
        });
      }
    }
    return res;
  };

  const toggleReaction = async (messageId, emoji) => {
    const res = await api.toggleReaction(messageId, emoji);
    if (res.success && res.message) {
      setChannelMessages(prev => prev.map(m => {
        if (m._id === res.message._id) {
          return { ...res.message, replies: m.replies || [] };
        }
        if (m.replies && m.replies.some(r => r._id === res.message._id)) {
          return {
            ...m,
            replies: m.replies.map(r => r._id === res.message._id ? res.message : r)
          };
        }
        return m;
      }));
    }
    return res;
  };

  const sendChatMessage = async (text, attachments = []) => {
    if (!currentChatId) return;
    const res = await api.sendChatMessage(currentChatId, text, attachments);
    if (res.success && res.message) {
      setChatMessages(prev => {
        if (prev.some(m => m._id === res.message._id)) return prev;
        return [...prev, res.message];
      });
      setChats(prev => prev.map(c => {
        if (c._id === currentChatId) {
          return {
            ...c,
            lastMessage: {
              text: res.message.text,
              sender: res.message.sender,
              timestamp: res.message.createdAt
            }
          };
        }
        return c;
      }));
    }
    return res;
  };

  const startOrGetDirectChat = async (targetUserId) => {
    try {
      const res = await api.createChat([targetUserId]);
      if (res.success && res.chat) {
        setChats(prev => {
          const exists = prev.find(c => c._id === res.chat._id);
          if (exists) return prev;
          return [res.chat, ...prev];
        });
        setCurrentChatId(res.chat._id);
        setCurrentApp('chat');
        return res.chat;
      }
    } catch (err) {
      console.error('Failed to start direct chat:', err);
    }
  };

  const createChannel = async (channelData) => {
    const res = await api.createChannel(channelData);
    if (res.success && res.channel) {
      setChannels(prev => [...prev, res.channel]);
      setCurrentChannelId(res.channel.id);
      setCurrentBrand(res.channel.brandId);
      setCurrentApp('teams');
    }
    return res;
  };

  const createMeeting = async (meetingData) => {
    const res = await api.createEvent(meetingData);
    if (res.success && res.event) {
      setEvents(prev => [...prev, res.event]);
    }
    return res;
  };

  const rsvpMeeting = async (eventId, status) => {
    const res = await api.rsvpEvent(eventId, status);
    if (res.success && res.event) {
      setEvents(prev => prev.map(e => e._id === eventId ? res.event : e));
    }
    return res;
  };

  const currentChannel = channels.find(c => c.id === currentChannelId) || {
    id: currentChannelId,
    name: currentChannelId.replace(/^[a-z]+-/, ''),
    brandId: currentBrand,
    topic: 'Official channel updates'
  };

  const currentChat = chats.find(c => c._id === currentChatId) || null;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentApp,
        setCurrentApp,
        currentBrand,
        setCurrentBrand,
        currentChannelId,
        setCurrentChannelId,
        currentChannel,
        currentChatId,
        setCurrentChatId,
        currentChat,
        brands,
        channels,
        channelMessages,
        chats,
        chatMessages,
        events,
        files,
        people,
        activities,
        unreadActivitiesCount,
        typingMap,
        // Modals
        isSearchOpen,
        setIsSearchOpen,
        isNewMeetingOpen,
        setIsNewMeetingOpen,
        isNewChannelOpen,
        setIsNewChannelOpen,
        isNewChatOpen,
        setIsNewChatOpen,
        selectedUserForProfile,
        setSelectedUserForProfile,
        // Methods
        sendChannelMessage,
        toggleReaction,
        sendChatMessage,
        startOrGetDirectChat,
        createChannel,
        createMeeting,
        rsvpMeeting,
        loadFiles,
        loadCalendarEvents
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
