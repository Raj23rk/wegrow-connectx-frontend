import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { socketService } from '../../services/socket';
import { Send, Smile, Paperclip, Video, Phone, Check, CheckCheck, Users2 } from 'lucide-react';

export const ChatView = () => {
  const { currentChat, chatMessages, sendChatMessage, typingMap, setIsNewMeetingOpen, setSelectedUserForProfile } = useApp();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const partner = currentChat?.type === 'group'
    ? { name: currentChat.name || 'Group Chat', status: 'available', color: '#5B5FC7' }
    : currentChat?.participants?.find(p => p._id !== user?._id) || { name: 'Direct Chat', status: 'available', color: '#5B5FC7' };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Emit typing indicator
    if (currentChat?._id) {
      socketService.startTyping('chat', currentChat._id, { _id: user._id, name: user.name });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping('chat', currentChat._id, { _id: user._id, name: user.name });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.stopTyping('chat', currentChat._id, { _id: user._id, name: user.name });

    const textToSend = inputText.trim();
    setInputText('');
    await sendChatMessage(textToSend);
  };

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
      <header className="h-14 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between flex-none z-10 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
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

        {/* Video Call button */}
        <button
          type="button"
          onClick={() => setIsNewMeetingOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-[#5B5FC7] hover:bg-[#4F52B2] shadow-sm transition-all"
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Start Call</span>
        </button>
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

            return (
              <div
                key={msg._id}
                className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center flex-none shadow-xs mt-1"
                    style={{ backgroundColor: msg.sender?.color || '#5B5FC7' }}
                  >
                    {msg.sender?.name?.substring(0, 2).toUpperCase() || 'WX'}
                  </div>
                )}

                <div className={`max-w-[78%] md:max-w-[65%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 px-1">
                      {msg.sender?.name}
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                      isMe
                        ? 'bg-[#5B5FC7] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#282828] text-gray-900 dark:text-white rounded-bl-xs border border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    {msg.text}
                  </div>

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
      <div className="p-3 md:p-4 bg-white dark:bg-[#242424] border-t border-gray-200 dark:border-gray-800 flex-none shadow-md">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            required
            placeholder={`Type a message to ${partner.name}...`}
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 text-xs md:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#282828] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white disabled:opacity-40 transition-all flex-none shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
