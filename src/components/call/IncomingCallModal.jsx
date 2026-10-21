import React from 'react';
import { useApp } from '../../context/AppContext';
import { Video, Phone, PhoneOff, Volume2, VolumeX, Shield, Building2 } from 'lucide-react';

export const IncomingCallModal = () => {
  const { incomingCall, acceptIncomingCall, rejectIncomingCall, isRingtoneMuted, toggleRingtoneMute } = useApp();

  if (!incomingCall) return null;

  const caller = incomingCall.caller || {};
  const isVideo = incomingCall.callType === 'video';

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
          <button
            type="button"
            onClick={toggleRingtoneMute}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all text-[11px]"
            title={isRingtoneMuted ? "Unmute Ringtone" : "Mute Ringtone"}
          >
            {isRingtoneMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRingtoneMuted ? "Ringtone Muted" : "Ringing"}</span>
          </button>
        </div>

        {/* Center Content */}
        <div className="px-6 py-6 text-center flex flex-col items-center">
          {/* Pulsing Avatar with Waves */}
          <div className="relative my-4 flex items-center justify-center">
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

          <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-indigo-300 font-medium flex items-center gap-2">
            {isVideo ? <Video className="w-3.5 h-3.5 text-[#7F85F5]" /> : <Phone className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Incoming {isVideo ? 'Microsoft Teams Video Call' : 'Microsoft Teams Audio Call'}</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 bg-black/40 border-t border-white/10 flex items-center justify-center gap-3">
          {/* Decline Button */}
          <button
            type="button"
            onClick={rejectIncomingCall}
            className="flex-1 py-3 px-4 rounded-2xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-600/30 active:scale-95"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Decline</span>
          </button>

          {/* Accept Audio */}
          <button
            type="button"
            onClick={() => acceptIncomingCall('audio')}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Audio</span>
          </button>

          {/* Accept Video */}
          <button
            type="button"
            onClick={() => acceptIncomingCall('video')}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#5B5FC7]/30 active:scale-95"
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};
