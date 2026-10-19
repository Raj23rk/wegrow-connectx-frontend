import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video, MapPin,
  Clock, CheckCircle, HelpCircle, XCircle, Users, ExternalLink, X
} from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export const CalendarView = () => {
  const { events, setIsNewMeetingOpen, rsvpMeeting } = useApp();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week'); // 'day' | 'work_week' | 'week'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Days calculations
  const getDaysForView = () => {
    const startOfWeek = new Date(currentDate);
    const dayIndex = startOfWeek.getDay(); // 0 is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - (dayIndex === 0 ? 6 : dayIndex - 1)); // start on Monday

    if (viewMode === 'day') {
      return [new Date(currentDate)];
    }

    const count = viewMode === 'work_week' ? 5 : 7;
    const days = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDaysForView();

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const handleRsvp = async (status) => {
    if (!selectedEvent) return;
    await rsvpMeeting(selectedEvent._id, status);
    setSelectedEvent(prev => {
      if (!prev) return null;
      const attendees = prev.attendees.map(a =>
        a.user?._id === user?._id ? { ...a, status } : a
      );
      return { ...prev, attendees };
    });
  };

  // Get user's current RSVP on selected event
  const myRsvp = selectedEvent?.attendees?.find(a => (a.user?._id || a.user) === user?._id)?.status || 'pending';

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1E1E1E] min-w-0 overflow-hidden select-none">
      {/* Calendar Toolbar */}
      <div className="h-14 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2 flex-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevPeriod}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={setToday}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Today
            </button>
            <button
              type="button"
              onClick={nextPeriod}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs md:text-sm font-extrabold text-gray-900 dark:text-white ml-2">
              {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'day' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode('work_week')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'work_week' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              Work Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'week' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              Week
            </button>
          </div>

          {/* New meeting button */}
          <button
            type="button"
            onClick={() => setIsNewMeetingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-[#5B5FC7] hover:bg-[#4F52B2] shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px] flex flex-col h-full">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(auto-fit,minmax(0,1fr))] border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-[#222222] sticky top-0 z-10">
            <div className="p-3 border-r border-gray-200 dark:border-gray-800 text-[10px] font-bold text-gray-400 text-center">
              GMT+5:30
            </div>
            {days.map((d, idx) => {
              const today = isToday(d);
              return (
                <div
                  key={idx}
                  className={`p-2.5 text-center border-r border-gray-200 dark:border-gray-800 ${
                    today ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-gray-400">
                    {d.toLocaleDateString([], { weekday: 'short' })}
                  </div>
                  <div className={`text-base font-extrabold ${today ? 'text-[#5B5FC7]' : 'text-gray-800 dark:text-gray-200'}`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hourly Slots */}
          <div className="flex-1 relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(auto-fit,minmax(0,1fr))] border-b border-gray-100 dark:border-gray-800/80 min-h-[64px]"
              >
                {/* Hour label */}
                <div className="p-1 text-[11px] font-semibold text-gray-400 text-right pr-3 border-r border-gray-200 dark:border-gray-800 select-none">
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                </div>

                {/* Day cells */}
                {days.map((d, dIdx) => {
                  const today = isToday(d);

                  // Find events matching this day and hour
                  const cellEvents = events.filter(e => {
                    const start = new Date(e.start);
                    return start.getDate() === d.getDate() &&
                      start.getMonth() === d.getMonth() &&
                      start.getFullYear() === d.getFullYear() &&
                      start.getHours() === hour;
                  });

                  return (
                    <div
                      key={dIdx}
                      className={`relative border-r border-gray-100 dark:border-gray-800/60 p-1 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all ${
                        today ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                      }`}
                    >
                      {cellEvents.map(event => (
                        <button
                          type="button"
                          key={event._id}
                          onClick={() => setSelectedEvent(event)}
                          className="w-full text-left p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border-l-4 border-l-[#5B5FC7] border-gray-200 dark:border-gray-700/80 shadow-xs hover:shadow-md transition-all mb-1 cursor-pointer"
                        >
                          <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {event.title}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meeting Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
          <div className="bg-white dark:bg-[#282828] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  ConnectX Meeting
                </span>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs text-gray-700 dark:text-gray-300">
              {/* Time */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400 flex-none" />
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {new Date(selectedEvent.start).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400 flex-none" />
                <span>{selectedEvent.location || 'WeGrow ConnectX Virtual Meet'}</span>
              </div>

              {/* Meeting Link Button */}
              {selectedEvent.meetingLink && (
                <div className="pt-2">
                  <a
                    href={selectedEvent.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Video Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              )}

              {/* Description */}
              {selectedEvent.description && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
                  <p className="whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}

              {/* Attendees list */}
              <div>
                <div className="font-bold text-xs text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Participants ({selectedEvent.attendees?.length || 0})</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {selectedEvent.attendees?.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: att.user?.color || '#5B5FC7' }}
                        >
                          {att.user?.name?.substring(0, 2).toUpperCase() || 'WX'}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {att.user?.name}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        att.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                        att.status === 'declined' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RSVP Action Bar */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="text-[11px] font-bold text-gray-500 mb-2">Going to this meeting?</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRsvp('accepted')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      myRsvp === 'accepted'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRsvp('tentative')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      myRsvp === 'tentative'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Tentative</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRsvp('declined')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      myRsvp === 'declined'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
