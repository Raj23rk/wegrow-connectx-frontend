import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Video,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Building2,
  Music,
  ChevronDown,
  Check
} from 'lucide-react';

export const IncomingCallModal = () => {
  const {
    incomingCall,
    acceptIncomingCall,
    rejectIncomingCall,
    isRingtoneMuted,
    toggleRingtoneMute,
    currentRingtone,
    setRingtone,
    ringtoneVolume,
    RINGTONE_LIST
  } = useApp();

  const [showRingtonePicker, setShowRingtonePicker] = useState(false);

  if (!incomingCall) return null;

  const caller = incomingCall.caller || {};
  const isVideo = incomingCall.callType === 'video';
  const currentRingtoneObj = RINGTONE_LIST.find(r => r.id === currentRingtone) || RINGTONE_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-pop">
      {/* Teams-Style Incoming Call Card */}
      <div className="w-full max-w-md bg-[#1F1F23]/95 text-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/15 overflow-hidden relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5B5FC7] via-[#0A2A8C] to-[#10B981]" />

        {/* Header bar */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold tracking-wider uppercase text-[10px] text-emerald-400">Incoming Direct Call</span>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Quick Ringtone Changer Button */}
            <button
              type="button"
              onClick={() => setShowRingtonePicker(!showRingtonePicker)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 transition-all text-[11px] cursor-pointer"
              title="Change Ringtone"
            >
              <Music className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[90px]">{currentRingtoneObj.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Mute Button */}
            <button
              type="button"
              onClick={toggleRingtoneMute}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all text-[11px] cursor-pointer"
              title={isRingtoneMuted ? "Unmute Ringtone" : "Mute Ringtone"}
            >
              {isRingtoneMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isRingtoneMuted ? "Muted" : "Ringing"}</span>
            </button>

            {/* Ringtone Dropdown */}
            {showRingtonePicker && (
              <div className="absolute right-0 top-8 w-56 bg-[#25252B] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-pop">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Select Ringtone
                </div>
                {RINGTONE_LIST.map(r => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setRingtone(r.id);
                      setShowRingtonePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                      currentRingtone === r.id
                        ? 'bg-[#5B5FC7] text-white font-bold'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    {currentRingtone === r.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Content */}
        <div className="px-6 py-5 text-center flex flex-col items-center">
          {/* Pulsing Avatar with Waves */}
          <div className="relative my-3 flex items-center justify-center">
            {/* Animated Ring Waves */}
            <div className="absolute w-28 h-28 rounded-full border-2 border-[#5B5FC7]/40 animate-ring-wave-1" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-[#5B5FC7]/30 animate-ring-wave-2" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-[#5B5FC7]/20 animate-ring-wave-3" />

            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full text-white font-extrabold text-2xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-[#1F1F23]"
              style={{ backgroundColor: caller.color || '#5B5FC7' }}
            >
              {caller.name ? caller.name.substring(0, 2).toUpperCase() : 'WX'}
            </div>
          </div>

          {/* Caller Details */}
          <h2 className="text-xl font-black text-white tracking-tight mt-2">
            {caller.name || 'ConnectX Colleague'}
          </h2>
          <p className="text-xs text-gray-300 font-semibold mt-0.5">
            {caller.title || 'Team Member'}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
            {caller.department && <span>{caller.department}</span>}
            {caller.branch && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {caller.branch}
                </span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 font-medium flex items-center gap-2">
              {isVideo ? <Video className="w-3.5 h-3.5 text-[#7F85F5]" /> : <Phone className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isVideo ? 'Teams Video Call' : 'Teams Audio Call'}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              <span>High Vol ({Math.round(ringtoneVolume * 100)}%)</span>
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 bg-black/40 border-t border-white/10 flex items-center justify-center gap-3">
          {/* Decline Button */}
          <button
            type="button"
            onClick={rejectIncomingCall}
            className="flex-1 py-3 px-4 rounded-2xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-600/30 active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Decline</span>
          </button>

          {/* Accept Audio */}
          <button
            type="button"
            onClick={() => acceptIncomingCall('audio')}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Audio</span>
          </button>

          {/* Accept Video */}
          <button
            type="button"
            onClick={() => acceptIncomingCall('video')}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#5B5FC7]/30 active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};
