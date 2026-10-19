import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, Users, X, Video } from 'lucide-react';

export const NewMeetingModal = () => {
  const { isNewMeetingOpen, setIsNewMeetingOpen, createMeeting, people } = useApp();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('WeGrow ConnectX Virtual Meet');
  const [brandId, setBrandId] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isNewMeetingOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime || !endTime) return;

    setLoading(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      await createMeeting({
        title: title.trim(),
        description: description.trim(),
        start: startDateTime,
        end: endDateTime,
        location,
        brandId,
        attendeeIds: selectedAttendees
      });

      setIsNewMeetingOpen(false);
      setTitle('');
      setDescription('');
      setSelectedAttendees([]);
    } catch (err) {
      alert(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (userId) => {
    if (selectedAttendees.includes(userId)) {
      setSelectedAttendees(selectedAttendees.filter(id => id !== userId));
    } else {
      setSelectedAttendees([...selectedAttendees, userId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-pop">
      <div className="bg-white dark:bg-[#282828] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Schedule New Meeting</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsNewMeetingOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Strategy Review & Brand Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">End Time</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Brand Scope</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs font-bold capitalize"
              >
                <option value="all">All Brands (Company-wide)</option>
                <option value="wegrow">WeGrow</option>
                <option value="skillcampus">SkillCampus</option>
                <option value="bschool">BSchool</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Location / Platform</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Attendees Picker */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Invite Participants ({selectedAttendees.length} selected)</span>
              <span className="text-[10px] text-gray-400 font-normal">Click to toggle</span>
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-2 space-y-1">
              {people.filter(p => p._id !== user?._id).map(p => {
                const isSelected = selectedAttendees.includes(p._id);
                return (
                  <button
                    type="button"
                    key={p._id}
                    onClick={() => toggleAttendee(p._id)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                        style={{ backgroundColor: p.color || '#5B5FC7' }}
                      >
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{p.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({p.title})</span>
                    </div>
                    {isSelected && <span className="text-[10px] font-extrabold text-blue-600">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Agenda / Notes</label>
            <textarea
              rows={2}
              placeholder="Outline discussion points, links or preparation notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#222222] text-gray-900 dark:text-white text-xs resize-none"
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsNewMeetingOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold transition-all shadow-sm"
            >
              {loading ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
