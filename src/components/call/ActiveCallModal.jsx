import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';

export const ActiveCallModal = () => {
  const {
    activeCall,
    endCurrentCall,
    toggleCallAudio,
    toggleCallVideo,
    toggleScreenShare,
    localStream,
    remoteStream
  } = useApp();

  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef(null);

  // Attach local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, activeCall?.isVideoOff]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, activeCall?.status]);

  if (!activeCall) return null;

  const partner = activeCall.partner || {};
  const isCalling = activeCall.status === 'calling';
  const isConnected = activeCall.status === 'connected';
  const isDeclined = activeCall.status === 'declined';
  const isEnded = activeCall.status === 'ended';
  const isBusy = activeCall.status === 'busy';

  const formatDuration = (secs = 0) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(mins)}:${pad(remainingSecs)}`;
  };

  const handleToggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 md:p-6 select-none animate-pop"
    >
      <div className="w-full max-w-5xl h-[88vh] bg-[#1B1B1E] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/10 flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-14 px-5 bg-[#141416]/90 border-b border-white/10 flex items-center justify-between flex-none z-20">
          <div className="flex items-center gap-3">
            {/* Teams badge */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B5FC7] to-[#0A2A8C] text-white flex items-center justify-center font-black text-xs shadow-md">
              WX
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight truncate max-w-xs md:max-w-md">
                  {partner.name || 'ConnectX Call'}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-indigo-300 border border-white/10">
                  {activeCall.type === 'video' ? 'Teams Video' : 'Teams Audio'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate flex items-center gap-1.5">
                <span>{partner.title || 'Team Member'}</span>
                {partner.branch && (
                  <>
                    <span>•</span>
                    <span>{partner.branch}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Call State / Duration */}
            {isConnected && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/40 border border-white/10 font-mono text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{formatDuration(activeCall.duration)}</span>
              </div>
            )}

            {isConnected && (
              <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>HD Call Encrypted</span>
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Main Stage View */}
        <div className="flex-1 bg-gradient-to-b from-[#18181B] to-[#0F0F12] relative overflow-hidden flex items-center justify-center p-4">
          {/* STATE 1: Calling / Ringing */}
          {isCalling && (
            <div className="flex flex-col items-center justify-center text-center max-w-sm">
              {/* Concentric Pulsing Ripples */}
              <div className="relative my-8 flex items-center justify-center">
                <div className="absolute w-36 h-36 rounded-full border border-[#5B5FC7]/40 animate-ring-wave-1" />
                <div className="absolute w-36 h-36 rounded-full border border-[#5B5FC7]/30 animate-ring-wave-2" />
                <div className="absolute w-36 h-36 rounded-full border border-[#5B5FC7]/20 animate-ring-wave-3" />

                <div
                  className="w-28 h-28 rounded-full text-white font-black text-3xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-[#24242A]"
                  style={{ backgroundColor: partner.color || '#5B5FC7' }}
                >
                  {partner.name ? partner.name.substring(0, 2).toUpperCase() : 'WX'}
                </div>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                Calling {partner.name}...
              </h2>
              <p className="text-xs text-indigo-300 font-semibold mt-1">
                Ringing WeGrow ConnectX terminal...
              </p>
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[11px] text-gray-400 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting for {partner.name} to answer</span>
              </div>
            </div>
          )}

          {/* STATE 2: Declined / Busy / Ended */}
          {(isDeclined || isBusy || isEnded) && (
            <div className="flex flex-col items-center justify-center text-center max-w-sm animate-pop">
              <div className="w-20 h-20 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mb-4">
                <PhoneOff className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">
                {isDeclined && `${partner.name} declined the call`}
                {isBusy && `${partner.name} is on another call`}
                {isEnded && 'Call Ended'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {isConnected || activeCall.duration > 0
                  ? `Duration: ${formatDuration(activeCall.duration)}`
                  : 'Disconnecting...'}
              </p>
            </div>
          )}

          {/* STATE 3: Connected */}
          {isConnected && (
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {/* Remote Video Element */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  remoteStream ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* If Remote Video is NOT showing or Audio-only Call */}
              {(!remoteStream || activeCall.type === 'audio') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#1C1C22] to-[#121216] p-6 text-center">
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute w-32 h-32 rounded-full bg-[#5B5FC7]/20 animate-pulse" />
                    <div
                      className="w-28 h-28 rounded-full text-white font-black text-3xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-[#24242A]"
                      style={{ backgroundColor: partner.color || '#5B5FC7' }}
                    >
                      {partner.name ? partner.name.substring(0, 2).toUpperCase() : 'WX'}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white mt-2">{partner.name}</h3>
                  <p className="text-xs text-gray-400 font-semibold">{partner.title || 'Team Member'}</p>

                  <div className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs text-emerald-400 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connected • Live Audio</span>
                  </div>
                </div>
              )}

              {/* Local Video Picture-in-Picture (PiP) */}
              <div className="absolute bottom-5 right-5 w-44 md:w-56 aspect-video bg-[#1B1B1F] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-30 group transition-all hover:scale-105">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    activeCall.isVideoOff ? 'hidden' : 'block'
                  }`}
                />

                {activeCall.isVideoOff && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#25252B] text-white">
                    <div
                      className="w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shadow-md mb-1"
                      style={{ backgroundColor: user?.color || '#5B5FC7' }}
                    >
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ME'}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Camera Off</span>
                  </div>
                )}

                {/* Local Status Badges */}
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  <span>You</span>
                  {activeCall.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Microsoft Teams Floating Toolbar */}
        <footer className="h-20 bg-[#141416] border-t border-white/10 px-6 flex items-center justify-center z-20">
          <div className="flex items-center gap-3 md:gap-4 bg-[#232328] px-4 md:px-6 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleCallAudio}
              className={`p-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center ${
                activeCall.isMuted
                  ? 'bg-red-600/90 hover:bg-red-600 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={activeCall.isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {activeCall.isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
            </button>

            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleCallVideo}
              className={`p-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center ${
                activeCall.isVideoOff
                  ? 'bg-red-600/90 hover:bg-red-600 text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={activeCall.isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
            >
              {activeCall.isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-white" />}
            </button>

            {/* Screen Share */}
            {isConnected && (
              <button
                type="button"
                onClick={toggleScreenShare}
                className={`p-3 rounded-xl transition-all font-bold text-xs flex items-center justify-center ${
                  activeCall.isScreenSharing
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={activeCall.isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
              >
                <MonitorUp className="w-5 h-5 text-white" />
              </button>
            )}

            <div className="w-px h-6 bg-white/15 mx-1" />

            {/* End / Leave Call Button */}
            <button
              type="button"
              onClick={() => endCurrentCall('user_hung_up')}
              className="py-3 px-5 md:px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs md:text-sm flex items-center gap-2 shadow-xl hover:shadow-red-600/40 transition-all active:scale-95"
            >
              <PhoneOff className="w-4 h-4 md:w-5 md:h-5" />
              <span>{isCalling ? 'Cancel' : 'Leave'}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
