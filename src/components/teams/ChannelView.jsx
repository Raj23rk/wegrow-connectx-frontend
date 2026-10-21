import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Hash, Megaphone, Video, Send, Smile, Paperclip, AlertCircle, MessageSquare,
  Bold, Italic, Code, Link, ChevronDown, ChevronUp, Check, CornerDownRight, AtSign, ArrowLeft
} from 'lucide-react';
import { EmojiPicker } from '../common/EmojiPicker';

const COMMON_REACTIONS = ['👍', '❤️', '🎉', '🚀', '👏', '🔥'];

export const ChannelView = () => {
  const {
    currentChannel,
    channelMessages,
    sendChannelMessage,
    toggleReaction,
    currentBrand,
    setIsNewMeetingOpen,
    setSelectedUserForProfile,
    isMobileChannelOpen,
    setIsMobileChannelOpen,
    people
  } = useApp();
  const { user } = useAuth();

  // New post composer state
  const [subject, setSubject] = useState('');
  const [postText, setPostText] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState(false);
  const [activeReplyEmojiPickerId, setActiveReplyEmojiPickerId] = useState(null);
  const [replyInputs, setReplyInputs] = useState({}); // messageId -> text
  const [expandedThreads, setExpandedThreads] = useState({}); // messageId -> boolean
  const [activeReactionPicker, setActiveReactionPicker] = useState(null);

  const composerRef = useRef(null);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    await sendChannelMessage({
      subject: subject.trim(),
      text: postText.trim(),
      isImportant
    });

    setSubject('');
    setPostText('');
    setIsImportant(false);
  };

  const handleSendReply = async (parentMessageId) => {
    const text = replyInputs[parentMessageId];
    if (!text || !text.trim()) return;

    await sendChannelMessage({
      parentMessageId,
      text: text.trim()
    });

    setReplyInputs(prev => ({ ...prev, [parentMessageId]: '' }));
    setExpandedThreads(prev => ({ ...prev, [parentMessageId]: true }));
  };

  const toggleThread = (messageId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F5] dark:bg-[#1E1E1E] min-w-0 overflow-hidden">
      {/* Channel Header */}
      <header className="h-14 bg-white dark:bg-[#252525] border-b border-gray-200 dark:border-gray-800 px-3 md:px-6 flex items-center justify-between flex-none z-10 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* Mobile Back Button */}
          <button
            type="button"
            onClick={() => setIsMobileChannelOpen(false)}
            className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-none"
            title="Back to Channels list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-none">
            {currentChannel.isAnnounce ? (
              <Megaphone className="w-4 h-4 text-orange-500" />
            ) : (
              <Hash className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white truncate">
                {currentChannel.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentBrand}
              </span>
            </div>
            {currentChannel.topic && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xl">
                {currentChannel.topic}
              </p>
            )}
          </div>
        </div>

        {/* Meet Video Call shortcut */}
        <button
          type="button"
          onClick={() => setIsNewMeetingOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-[#5B5FC7] hover:bg-[#4F52B2] shadow-sm transition-all"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Meet</span>
        </button>
      </header>

      {/* Channel Feed / Posts Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {channelMessages.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Hash className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
              Welcome to #{currentChannel.name}!
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              This is the beginning of the #{currentChannel.name} channel. Start a new post below to collaborate with the team.
            </p>
          </div>
        ) : (
          channelMessages.map(post => {
            const isThreadExpanded = !!expandedThreads[post._id];
            const replies = post.replies || [];

            return (
              <div
                key={post._id}
                className={`bg-white dark:bg-[#282828] rounded-2xl shadow-xs border transition-all ${
                  post.isImportant
                    ? 'border-t-4 border-t-red-500 border-gray-200 dark:border-gray-800'
                    : 'border-gray-200/90 dark:border-gray-800'
                }`}
              >
                {/* Main Post Card */}
                <div className="p-4 md:p-5">
                  {/* Important Flag Badge */}
                  {post.isImportant && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Important Announcement
                    </div>
                  )}

                  {/* Sender Row */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForProfile(post.sender)}
                      className="w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center flex-none shadow-xs hover:opacity-90"
                      style={{ backgroundColor: post.sender?.color || '#5B5FC7' }}
                    >
                      {post.sender?.name?.substring(0, 2).toUpperCase() || 'WX'}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUserForProfile(post.sender)}
                          className="font-bold text-xs text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
                        >
                          {post.sender?.name}
                        </button>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {post.sender?.title}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {formatTime(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Subject Line */}
                  {post.subject && (
                    <h3 className="font-extrabold text-sm md:text-base text-gray-900 dark:text-white mb-2 leading-snug">
                      {post.subject}
                    </h3>
                  )}

                  {/* Post Content */}
                  <div className="text-xs md:text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </div>

                  {/* Reactions Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    {/* Existing reactions */}
                    {(post.reactions || []).map(r => {
                      const userReacted = r.users?.some(u => (u._id || u) === user?._id);

                      return (
                        <button
                          type="button"
                          key={r.emoji}
                          onClick={() => toggleReaction(post._id, r.emoji)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            userReacted
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span>{r.users?.length || 1}</span>
                        </button>
                      );
                    })}

                    {/* Quick Reaction Buttons */}
                    <div className="flex items-center gap-1 ml-1">
                      {COMMON_REACTIONS.map(emoji => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => toggleReaction(post._id, emoji)}
                          className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-xs flex items-center justify-center transition-all opacity-70 hover:opacity-100"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Thread Replies Button */}
                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={() => toggleThread(post._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#5B5FC7] dark:text-[#9EA2FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {replies.length > 0 ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : 'Reply'}
                        </span>
                        {replies.length > 0 && (
                          isThreadExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Thread Replies Section */}
                {isThreadExpanded && (
                  <div className="bg-gray-50/80 dark:bg-[#202020] border-t border-gray-100 dark:border-gray-800 p-4 rounded-b-2xl space-y-3">
                    {/* Replies stream */}
                    {replies.map(rep => (
                      <div key={rep._id} className="flex gap-2.5 pl-2">
                        <div
                          className="w-7 h-7 rounded-full text-white font-bold text-[10px] flex items-center justify-center flex-none shadow-xs mt-0.5"
                          style={{ backgroundColor: rep.sender?.color || '#5B5FC7' }}
                        >
                          {rep.sender?.name?.substring(0, 2).toUpperCase() || 'WX'}
                        </div>
                        <div className="min-w-0 flex-1 bg-white dark:bg-[#282828] p-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xs">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                              {rep.sender?.name}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatTime(rep.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {rep.text}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Input Box */}
                    <div className="flex gap-2 items-center pl-2 pt-2">
                      <CornerDownRight className="w-4 h-4 text-gray-400 flex-none" />
                      <input
                        type="text"
                        placeholder="Reply to this thread... (Press Enter)"
                        value={replyInputs[post._id] || ''}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [post._id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendReply(post._id);
                          }
                        }}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#282828] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                      />
                      <div className="relative">
                        {activeReplyEmojiPickerId === post._id && (
                          <EmojiPicker
                            onSelect={(emoji) => setReplyInputs({
                              ...replyInputs,
                              [post._id]: (replyInputs[post._id] || '') + emoji
                            })}
                            onClose={() => setActiveReplyEmojiPickerId(null)}
                            align="right"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveReplyEmojiPickerId(activeReplyEmojiPickerId === post._id ? null : post._id)}
                          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex-none transition-all"
                          title="Add Emoji"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendReply(post._id)}
                        className="p-2 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white flex-none transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Post Bottom Composer */}
      <div className="p-3 md:p-4 bg-white dark:bg-[#242424] border-t border-gray-200 dark:border-gray-800 flex-none shadow-md">
        <form onSubmit={handleCreatePost} className="max-w-4xl mx-auto space-y-2">
          {/* Subject Line */}
          <input
            type="text"
            placeholder="Add a subject header (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-transparent focus:border-gray-300 dark:focus:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
          />

          {/* Text Area */}
          <div className="relative border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-[#282828] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
            <textarea
              ref={composerRef}
              rows={2}
              required
              placeholder={`Start a new post in #${currentChannel.name}...`}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleCreatePost(e);
                }
              }}
              className="w-full p-3 text-xs md:text-sm bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none"
            ></textarea>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <button
                  type="button"
                  onClick={() => setPostText(prev => prev + '**bold**')}
                  title="Bold"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostText(prev => prev + '_italic_')}
                  title="Italic"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPostText(prev => prev + '```code```')}
                  title="Code Block"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Emoji Picker Button */}
                <div className="relative">
                  {showPostEmojiPicker && (
                    <EmojiPicker
                      onSelect={(emoji) => setPostText(prev => prev + emoji)}
                      onClose={() => setShowPostEmojiPicker(false)}
                      align="left"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPostEmojiPicker(!showPostEmojiPicker)}
                    title="Insert Emoji"
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      showPostEmojiPicker
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-[#5B5FC7]'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>Emoji</span>
                  </button>
                </div>

                {/* Mention Helper */}
                <button
                  type="button"
                  onClick={() => setPostText(prev => prev + '@')}
                  title="Mention Colleague (@) with Resend email notification"
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-all"
                >
                  <AtSign className="w-3.5 h-3.5" />
                  <span>Mention</span>
                </button>

                <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                <button
                  type="button"
                  onClick={() => setIsImportant(!isImportant)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                    isImportant
                      ? 'bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Important</span>
                </button>
              </div>

              {/* Submit Post Button */}
              <button
                type="submit"
                disabled={!postText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs text-white bg-[#5B5FC7] hover:bg-[#4F52B2] disabled:opacity-40 transition-all shadow-xs"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
