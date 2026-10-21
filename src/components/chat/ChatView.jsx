import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';
import { api } from '../../services/api';
import { Send, Smile, Paperclip, Video, Phone, Check, CheckCheck, Users2, Calendar, AtSign, ArrowLeft } from 'lucide-react';
import { EmojiPicker } from '../common/EmojiPicker';

export const ChatView = () => {
  const {
    currentChat,
    setCurrentChatId,
    chatMessages,
    sendChatMessage,
    typingMap,
    setIsNewMeetingOpen,
    setSelectedUserForProfile,
    startDirectCall,
    people,
    setPeople,
    isMobileChatOpen,
    setIsMobileChatOpen,
    toggleReaction
  } = useApp();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Ensure people list is loaded for @mentions
  useEffect(() => {
    if (!people || people.length === 0) {
      api.getUsers().then(res => {
        if (res.success && res.users) {
          setPeople(res.users);
        }
      }).catch(err => console.warn('Could not load users for mentions:', err));
    }
  }, [people, setPeople]);

  const partner = currentChat?.type === 'group'
    ? { name: currentChat.name || 'Group Chat', status: 'available', color: '#5B5FC7' }
    : currentChat?.participants?.find(p => p._id !== user?._id) || { name: 'Direct Chat', status: 'available', color: '#5B5FC7' };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    // Detect @mention trigger
    const lastAtPos = val.lastIndexOf('@');
    if (lastAtPos !== -1 && (lastAtPos === 0 || /\s/.test(val[lastAtPos - 1]))) {
      const query = val.slice(lastAtPos + 1);
      if (!/\s/.test(query)) {
        setMentionQuery(query.toLowerCase());
      } else {
        setMentionQuery(null);
      }
    } else {
      setMentionQuery(null);
    }

    // Emit typing indicator
    if (currentChat?._id) {
      socketService.startTyping('chat', currentChat._id, { _id: user._id, name: user.name });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping('chat', currentChat._id, { _id: user._id, name: user.name });
      }, 2000);
    }
  };

  const handleSelectMention = (targetPerson) => {
    const lastAtPos = inputText.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const before = inputText.slice(0, lastAtPos);
      setInputText(`${before}@${targetPerson.name} `);
    }
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  const handleSelectEmoji = (emoji) => {
    setInputText(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.stopTyping('chat', currentChat._id, { _id: user._id, name: user.name });

    const textToSend = inputText.trim();
    setInputText('');
    setShowEmojiPicker(false);
    setMentionQuery(null);
    await sendChatMessage(textToSend);
  };

  const allMentionCandidates = React.useMemo(() => {
    const list = [
      ...(people && people.length > 0 ? people : []),
      ...(currentChat?.participants || [])
    ];
    const map = new Map();
    list.forEach(p => {
      if (p && p._id && !map.has(p._id)) {
        map.set(p._id, p);
      }
    });
    return Array.from(map.values());
  }, [people, currentChat]);

  const filteredMentionPeople = allMentionCandidates.filter(p => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q));
  });

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const typingUsers = Array.from(typingMap[currentChat?._id] || []);

  const statusColor = partner.status === 'busy' || partner.status === 'dnd'
    ? '#C4314B'
    : partner.status === 'away' || partner.status === 'brb'
    ? '#FFAA44'
    : '#6BB700';

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5F5] dark:bg-[#1E1E1E]">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-[#5B5FC7] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Users2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-1">Select a Conversation</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pick a contact from the list or start a new direct chat with someone across WeGrow, SkillCampus or BSchool.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1E1E1E] min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-gray-800 px-3 md:px-6 flex items-center justify-between flex-none z-10 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={() => {
              setIsMobileChatOpen(false);
              setCurrentChatId(null);
            }}
            className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-none"
            title="Back to Chats list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-none">
            <button
              type="button"
              onClick={() => setSelectedUserForProfile(partner)}
              className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs"
              style={{ backgroundColor: partner.color || '#5B5FC7' }}
            >
              {partner.name.substring(0, 2).toUpperCase()}
            </button>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#252525]"
              style={{ backgroundColor: statusColor }}
            ></span>
          </div>

          <div className="min-w-0">
            <h2 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white truncate">
              {partner.name}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
              <span>{partner.title || 'Team Member'}</span>
              <span>•</span>
              <span className="capitalize" style={{ color: statusColor }}>{partner.status}</span>
              {partner.statusMessage && (
                <>
                  <span>•</span>
                  <span className="truncate italic">"{partner.statusMessage}"</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Call & Meet action buttons (Microsoft Teams calling format) */}
        <div className="flex items-center gap-1.5">
          {/* Direct Video Call Button */}
          <button
            type="button"
            onClick={() => startDirectCall(partner, 'video')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-[#5B5FC7] hover:bg-[#4F52B2] shadow-sm transition-all active:scale-95"
            title="Start Direct Teams Video Call"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Call</span>
          </button>

          {/* Direct Audio Call Button */}
          <button
            type="button"
            onClick={() => startDirectCall(partner, 'audio')}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all active:scale-95"
            title="Start Direct Teams Audio Call"
          >
            <Phone className="w-3.5 h-3.5" />
          </button>

          {/* Schedule Meeting for Later */}
          <button
            type="button"
            onClick={() => setIsNewMeetingOpen(true)}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all hidden md:flex items-center"
            title="Schedule a Calendar Meeting"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-xs">
            Say hello to start the conversation!
          </div>
        ) : (
          chatMessages.map(msg => {
            const isMe = (msg.sender?._id || msg.sender) === user?._id;

            // Check if message is a call log
            if (msg.text && msg.text.startsWith('📞')) {
              return (
                <div key={msg._id} className="w-full flex justify-center my-2">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-indigo-50/70 dark:bg-[#252530] border border-indigo-150 dark:border-indigo-900/30 text-xs text-indigo-900 dark:text-indigo-200 shadow-xs">
                    <span className="p-1 rounded-lg bg-[#5B5FC7] text-white">
                      <Phone className="w-3 h-3" />
                    </span>
                    <span className="font-semibold">{msg.text.replace('📞', '').trim()}</span>
                    <span className="text-[10px] text-gray-400 font-mono">• {formatTime(msg.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => startDirectCall(partner, 'video')}
                      className="ml-2 text-[11px] font-bold text-[#5B5FC7] dark:text-[#7F85F5] hover:underline"
                    >
                      Call back
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg._id}
                onMouseEnter={() => setHoveredMsgId(msg._id)}
                onMouseLeave={() => setHoveredMsgId(null)}
                className={`flex gap-2.5 group relative ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center flex-none shadow-xs mt-1"
                    style={{ backgroundColor: msg.sender?.color || '#5B5FC7' }}
                  >
                    {msg.sender?.name?.substring(0, 2).toUpperCase() || 'WX'}
                  </div>
                )}

                <div className={`max-w-[78%] md:max-w-[65%] space-y-1 relative ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 px-1">
                      {msg.sender?.name}
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap shadow-xs relative ${
                      isMe
                        ? 'bg-[#5B5FC7] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#282828] text-gray-900 dark:text-white rounded-bl-xs border border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    {/* Highlight mentions in text */}
                    {msg.text.split(/(@[A-Za-z0-9_.-]+(?:\s+[A-Za-z0-9_.-]+)?)/g).map((part, pIdx) => {
                      if (part.startsWith('@')) {
                        return (
                          <span
                            key={pIdx}
                            className={`font-bold px-1.5 py-0.5 rounded-md text-[11px] md:text-xs inline-block ${
                              isMe
                                ? 'bg-white/20 text-white underline'
                                : 'bg-indigo-50 dark:bg-indigo-950/80 text-[#5B5FC7] dark:text-[#9EA2FF] border border-indigo-200/50 dark:border-indigo-800/50'
                            }`}
                          >
                            {part}
                          </span>
                        );
                      }
                      return part;
                    })}
                  </div>

                  {/* Message Reactions Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 pt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {msg.reactions.map(r => {
                        const userReacted = r.users?.some(u => (u._id || u) === user?._id);
                        return (
                          <button
                            type="button"
                            key={r.emoji}
                            onClick={() => toggleReaction(msg._id, r.emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                              userReacted
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            <span>{r.emoji}</span>
                            <span>{r.users?.length || 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Reaction Emoji Toolbar on Hover */}
                  {hoveredMsgId === msg._id && (
                    <div
                      className={`absolute -top-7 ${
                        isMe ? 'right-0' : 'left-0'
                      } bg-white dark:bg-[#202020] border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 shadow-lg flex items-center gap-1 z-20 animate-pop`}
                    >
                      {['👍', '❤️', '😂', '🎉', '🔥', '👏'].map(emoji => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => toggleReaction(msg._id, emoji)}
                          className="w-5 h-5 rounded hover:scale-125 text-xs flex items-center justify-center transition-transform"
                          title={`React ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-1 px-1 text-[10px] text-gray-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-blue-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-1 text-[11px] text-gray-400 dark:text-gray-500 italic bg-transparent">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Composer */}
      <div className="p-2 sm:p-4 bg-white dark:bg-[#242424] border-t border-gray-200 dark:border-gray-800 flex-none shadow-md relative">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2 relative">
          {/* Mention Suggestions Popover */}
          {mentionQuery !== null && filteredMentionPeople.length > 0 && (
            <div className="absolute bottom-full mb-2 left-0 right-0 sm:left-12 sm:right-auto sm:w-80 bg-white dark:bg-[#282828] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-pop">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-[#202020] flex items-center justify-between">
                <span>Mention Colleague</span>
                <span className="text-indigo-500 dark:text-indigo-400 font-semibold">Resend Email</span>
              </div>
              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredMentionPeople.slice(0, 8).map(p => (
                  <button
                    type="button"
                    key={p._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectMention(p);
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 text-left transition-all cursor-pointer"
                  >
                    <div
                      className="w-7 h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center flex-none shadow-xs"
                      style={{ backgroundColor: p.color || '#5B5FC7' }}
                    >
                      {(p.name || 'WX').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {p.title || p.department || p.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <EmojiPicker
              onSelect={handleSelectEmoji}
              onClose={() => setShowEmojiPicker(false)}
              align="left"
            />
          )}

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 transition-all flex-none ${
              showEmojiPicker
                ? 'bg-indigo-100 dark:bg-indigo-950 text-[#5B5FC7]'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Add Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Quick Mention Button */}
          <button
            type="button"
            onClick={() => {
              setInputText(prev => prev + '@');
              setMentionQuery('');
              inputRef.current?.focus();
            }}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-[#5B5FC7] dark:text-gray-400 dark:hover:text-[#7F85F5] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-none hidden sm:flex items-center"
            title="Mention Colleague (@) with Resend email notification"
          >
            <AtSign className="w-4 h-4" />
          </button>

          <input
            ref={inputRef}
            type="text"
            required
            placeholder={`Type a message or @mention to ${partner.name}...`}
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#282828] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white disabled:opacity-40 transition-all flex-none shadow-xs active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
