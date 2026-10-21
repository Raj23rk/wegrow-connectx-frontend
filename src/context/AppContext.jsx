import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { callAudio } from '../services/callAudio';
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

  // Direct Calling (Microsoft Teams calling format)
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRingtoneMuted, setIsRingtoneMuted] = useState(false);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const activeCallRef = useRef(null);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

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

  // Mobile navigation state
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isMobileChannelOpen, setIsMobileChannelOpen] = useState(false);

  // Load initial global data once authenticated
  const loadInitialData = useCallback(async () => {
    if (!user) return;
    try {
      const results = await Promise.allSettled([
        api.getBrands(),
        api.getChannels(),
        api.getChats(),
        api.getUsers(),
        api.getActivities()
      ]);

      const [brandsRes, channelsRes, chatsRes, peopleRes, activitiesRes] = results.map(
        r => (r.status === 'fulfilled' ? r.value : {})
      );

      if (brandsRes?.success) setBrands(brandsRes.brands || []);
      if (channelsRes?.success) setChannels(channelsRes.channels || []);
      if (chatsRes?.success) {
        setChats(chatsRes.chats || []);
        if (chatsRes.chats && chatsRes.chats.length > 0 && !currentChatId) {
          setCurrentChatId(chatsRes.chats[0]._id);
        }
      }
      if (peopleRes?.success) setPeople(peopleRes.users || []);
      if (activitiesRes?.success) {
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

    // Real-time Activity / Mention notification
    const handleNewActivity = (newAct) => {
      setActivities(prev => [newAct, ...prev]);
      setUnreadActivitiesCount(prev => prev + 1);
    };

    // Updated direct chat message (reactions)
    const handleUpdatedChatMessage = ({ chatId, message }) => {
      if (chatId === currentChatId) {
        setChatMessages(prev => prev.map(m => m._id === message._id ? message : m));
      }
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('message:updated', handleUpdatedMessage);
    socketService.on('message:deleted', handleDeletedMessage);
    socketService.on('chat:message:new', handleNewChatMessage);
    socketService.on('chat:message:updated', handleUpdatedChatMessage);
    socketService.on('user:presence', handleUserPresence);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);
    socketService.on('calendar:event:new', handleCalendarEventNew);
    socketService.on('calendar:event:updated', handleCalendarEventUpdated);
    socketService.on('calendar:event:deleted', handleCalendarEventDeleted);
    socketService.on('activity:new', handleNewActivity);

    return () => {
      socketService.off('message:new', handleNewMessage);
      socketService.off('message:updated', handleUpdatedMessage);
      socketService.off('message:deleted', handleDeletedMessage);
      socketService.off('chat:message:new', handleNewChatMessage);
      socketService.off('chat:message:updated', handleUpdatedChatMessage);
      socketService.off('user:presence', handleUserPresence);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
      socketService.off('calendar:event:new', handleCalendarEventNew);
      socketService.off('calendar:event:updated', handleCalendarEventUpdated);
      socketService.off('calendar:event:deleted', handleCalendarEventDeleted);
      socketService.off('activity:new', handleNewActivity);
    };
  }, [user, currentChannelId, currentChatId]);

  // WebRTC PeerConnection Setup
  const setupPeerConnection = (callId, targetUserId, initialLocalStream) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    peerConnectionRef.current = pc;

    if (initialLocalStream) {
      initialLocalStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, initialLocalStream);
        } catch (e) {}
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendCallSignal({
          callId,
          to: targetUserId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      }
    };

    return pc;
  };

  const cleanupMediaAndPeer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  // Direct Call Socket Listeners
  useEffect(() => {
    if (!user) return;

    const handleCallIncoming = (data) => {
      const cur = activeCallRef.current;
      if (cur && cur.status !== 'ended' && cur.status !== 'declined') {
        socketService.sendCallBusy({ callId: data.callId, to: data.caller?._id });
        return;
      }
      setIncomingCall(data);
      callAudio.playIncomingRingtone();
    };

    const handleCallAccepted = async ({ callId, recipient, acceptType }) => {
      callAudio.stopOutgoingRingback();
      callAudio.playCallConnected();

      setActiveCall(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'connected',
          startTime: Date.now()
        };
      });

      const pc = setupPeerConnection(callId, recipient._id, localStreamRef.current);
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);

        socketService.sendCallSignal({
          callId,
          to: recipient._id,
          signal: { type: 'offer', sdp: pc.localDescription }
        });
      } catch (err) {
        console.warn('[WebRTC] Error creating offer:', err.message);
      }
    };

    const handleCallRejected = () => {
      callAudio.stopAll();
      callAudio.playCallEnded();
      cleanupMediaAndPeer();
      setActiveCall(prev => prev ? { ...prev, status: 'declined' } : null);
      setTimeout(() => {
        setActiveCall(null);
      }, 2500);
    };

    const handleCallEnded = () => {
      callAudio.stopAll();
      callAudio.playCallEnded();
      cleanupMediaAndPeer();
      setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
      setIncomingCall(null);
      setTimeout(() => {
        setActiveCall(null);
      }, 2000);
    };

    const handleCallBusy = () => {
      callAudio.stopAll();
      callAudio.playCallEnded();
      cleanupMediaAndPeer();
      setActiveCall(prev => prev ? { ...prev, status: 'busy' } : null);
      setTimeout(() => {
        setActiveCall(null);
      }, 2500);
    };

    const handleCallSignal = async ({ callId, from, signal }) => {
      let pc = peerConnectionRef.current;
      if (!pc) {
        pc = setupPeerConnection(callId, from, localStreamRef.current);
      }

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketService.sendCallSignal({
            callId,
            to: from,
            signal: { type: 'answer', sdp: pc.localDescription }
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'candidate' && signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('[WebRTC] Signal handling error:', err.message);
      }
    };

    socketService.on('call:incoming', handleCallIncoming);
    socketService.on('call:accepted', handleCallAccepted);
    socketService.on('call:rejected', handleCallRejected);
    socketService.on('call:ended', handleCallEnded);
    socketService.on('call:busy', handleCallBusy);
    socketService.on('call:signal', handleCallSignal);

    return () => {
      socketService.off('call:incoming', handleCallIncoming);
      socketService.off('call:accepted', handleCallAccepted);
      socketService.off('call:rejected', handleCallRejected);
      socketService.off('call:ended', handleCallEnded);
      socketService.off('call:busy', handleCallBusy);
      socketService.off('call:signal', handleCallSignal);
    };
  }, [user]);

  // Call duration counter
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => {
          if (!prev || prev.status !== 'connected') return prev;
          return { ...prev, duration: (prev.duration || 0) + 1 };
        });
      }, 1000);
      return () => {
        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
          callTimerRef.current = null;
        }
      };
    }
  }, [activeCall?.status]);

  // Actions
  const startDirectCall = async (targetPartner, callType = 'video') => {
    if (!user || !targetPartner) return;
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;

    const newCall = {
      callId,
      partner: targetPartner,
      type: callType,
      role: 'caller',
      status: 'calling',
      startTime: null,
      duration: 0,
      isMuted: false,
      isVideoOff: callType === 'audio',
      isScreenSharing: false,
      chatId: currentChatId
    };
    setActiveCall(newCall);

    callAudio.playOutgoingRingback();

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
    } catch (err) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (err2) {
        console.warn('[Call] Camera/mic unavailable:', err2.message);
      }
    }

    if (stream) {
      localStreamRef.current = stream;
      setLocalStream(stream);
    }

    socketService.initiateCall({
      callId,
      recipientId: targetPartner._id,
      caller: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
        title: user.title,
        department: user.department,
        branch: user.branch
      },
      callType,
      chatId: currentChatId
    });
  };

  const acceptIncomingCall = async (acceptType = null) => {
    if (!incomingCall) return;
    const type = acceptType || incomingCall.callType || 'video';

    callAudio.stopIncomingRingtone();
    callAudio.playCallConnected();

    const currIncoming = incomingCall;
    setIncomingCall(null);

    const callState = {
      callId: currIncoming.callId,
      partner: currIncoming.caller,
      type,
      role: 'callee',
      status: 'connected',
      startTime: Date.now(),
      duration: 0,
      isMuted: false,
      isVideoOff: type === 'audio',
      isScreenSharing: false,
      chatId: currIncoming.chatId
    };
    setActiveCall(callState);

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
    } catch (err) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (err2) {}
    }

    if (stream) {
      localStreamRef.current = stream;
      setLocalStream(stream);
    }

    setupPeerConnection(currIncoming.callId, currIncoming.caller._id, stream);

    socketService.acceptCall({
      callId: currIncoming.callId,
      to: currIncoming.caller._id,
      recipient: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        color: user.color,
        title: user.title,
        department: user.department,
        branch: user.branch
      },
      acceptType: type
    });
  };

  const rejectIncomingCall = () => {
    if (!incomingCall) return;
    callAudio.stopIncomingRingtone();
    callAudio.playCallEnded();

    socketService.rejectCall({
      callId: incomingCall.callId,
      to: incomingCall.caller._id,
      reason: 'declined'
    });

    setIncomingCall(null);
  };

  const endCurrentCall = (reason = 'completed') => {
    callAudio.stopAll();
    callAudio.playCallEnded();

    const cur = activeCallRef.current;
    if (cur) {
      if (cur.partner?._id) {
        socketService.endCall({
          callId: cur.callId,
          to: cur.partner._id,
          reason,
          duration: cur.duration
        });
      }

      if (cur.chatId && cur.duration > 0) {
        const mins = Math.floor(cur.duration / 60);
        const secs = cur.duration % 60;
        const durStr = `${mins > 0 ? `${mins}m ` : ''}${secs}s`;
        const callLabel = cur.type === 'video' ? 'Video call' : 'Audio call';
        sendChatMessage(`📞 ${callLabel} ended • ${durStr}`).catch(() => {});
      } else if (cur.chatId && cur.role === 'caller' && cur.status !== 'connected') {
        const callLabel = cur.type === 'video' ? 'video call' : 'audio call';
        sendChatMessage(`📞 Cancelled ${callLabel}`).catch(() => {});
      }
    }

    cleanupMediaAndPeer();

    setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
    setTimeout(() => {
      setActiveCall(null);
    }, 1500);
  };

  const toggleCallAudio = () => {
    setActiveCall(prev => {
      if (!prev) return null;
      const nextMuted = !prev.isMuted;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => {
          t.enabled = !nextMuted;
        });
      }
      return { ...prev, isMuted: nextMuted };
    });
  };

  const toggleCallVideo = () => {
    setActiveCall(prev => {
      if (!prev) return null;
      const nextOff = !prev.isVideoOff;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => {
          t.enabled = !nextOff;
        });
      }
      return { ...prev, isVideoOff: nextOff };
    });
  };

  const toggleScreenShare = async () => {
    if (!activeCall || activeCall.status !== 'connected') return;

    if (activeCall.isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      if (localStreamRef.current && peerConnectionRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack).catch(() => {});
        }
      }
      setActiveCall(prev => prev ? { ...prev, isScreenSharing: false } : null);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack).catch(() => {});
          }
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setActiveCall(prev => prev ? { ...prev, isScreenSharing: true } : null);
      } catch (err) {
        console.warn('[ScreenShare] Error:', err.message);
      }
    }
  };

  const toggleRingtoneMute = () => {
    setIsRingtoneMuted(prev => {
      const next = !prev;
      if (next) callAudio.stopIncomingRingtone();
      else callAudio.playIncomingRingtone();
      return next;
    });
  };
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
        setPeople,
        activities,
        unreadActivitiesCount,
        typingMap,
        // Mobile layout toggles
        isMobileChatOpen,
        setIsMobileChatOpen,
        isMobileChannelOpen,
        setIsMobileChannelOpen,
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
        loadCalendarEvents,
        // Direct Calling (Microsoft Teams format)
        activeCall,
        incomingCall,
        localStream,
        remoteStream,
        isRingtoneMuted,
        startDirectCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endCurrentCall,
        toggleCallAudio,
        toggleCallVideo,
        toggleScreenShare,
        toggleRingtoneMute
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
