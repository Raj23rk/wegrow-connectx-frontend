import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Music,
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  X,
  Sparkles,
  Bell,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const RingtoneModal = () => {
  const {
    isRingtoneModalOpen,
    setIsRingtoneModalOpen,
    currentRingtone,
    setRingtone,
    ringtoneVolume,
    setRingtoneVolume,
    previewRingtone,
    stopPreviewRingtone,
    RINGTONE_LIST
  } = useApp();

  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    if (!isRingtoneModalOpen && playingId) {
      stopPreviewRingtone();
      setPlayingId(null);
    }
  }, [isRingtoneModalOpen]);

  if (!isRingtoneModalOpen) return null;

  const handlePlayPreview = (id, e) => {
    e.stopPropagation();
    if (playingId === id) {
      stopPreviewRingtone();
      setPlayingId(null);
    } else {
      stopPreviewRingtone();
      setPlayingId(id);
      previewRingtone(id);
    }
  };

  const handleSelectRingtone = (id) => {
    setRingtone(id);
    if (playingId && playingId !== id) {
      stopPreviewRingtone();
      setPlayingId(id);
      previewRingtone(id);
    }
  };

  const handleClose = () => {
    stopPreviewRingtone();
    setPlayingId(null);
    setIsRingtoneModalOpen(false);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setRingtoneVolume(val);
  };

  const volumePercent = Math.round((ringtoneVolume || 1.0) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md select-none animate-pop">
      <div className="w-full max-w-lg bg-[#1B1B1E] text-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/10 overflow-hidden flex flex-col relative">
        {/* Ambient Top Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#5B5FC7] via-[#0A2A8C] to-[#10B981]" />

        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#151518]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5B5FC7] to-[#0A2A8C] text-white flex items-center justify-center shadow-md">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Call Ringtone Settings
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B5FC7]/20 text-[#A6ACFF] border border-[#5B5FC7]/30 uppercase tracking-wider">
                  Teams Audio
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Choose your incoming call ringtone and adjust playback volume
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Volume Control Card */}
          <div className="p-4 rounded-2xl bg-[#232328] border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-200">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Ringtone Volume</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px]">
                {volumePercent}% {volumePercent >= 80 ? '• High Volume' : ''}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <VolumeX className="w-4 h-4 text-gray-500 flex-none" />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={ringtoneVolume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#5B5FC7]"
              />
              <Volume2 className="w-4 h-4 text-emerald-400 flex-none" />
            </div>

            {/* Quick Volume Preset Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Presets:</span>
              <button
                type="button"
                onClick={() => setRingtoneVolume(1.0)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  volumePercent === 100
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                100% (High Volume)
              </button>
              <button
                type="button"
                onClick={() => setRingtoneVolume(0.75)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  volumePercent === 75
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => setRingtoneVolume(0.5)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  volumePercent === 50
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                50%
              </button>
            </div>
          </div>

          {/* Ringtone Selection List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-300 px-1">
              <span>Available Ringtones</span>
              <span className="text-[10px] text-gray-400">Click to select & preview</span>
            </div>

            {RINGTONE_LIST.map((ringtone) => {
              const isSelected = currentRingtone === ringtone.id;
              const isPlaying = playingId === ringtone.id;

              return (
                <div
                  key={ringtone.id}
                  onClick={() => handleSelectRingtone(ringtone.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#5B5FC7]/20 to-[#0A2A8C]/20 border-[#5B5FC7] shadow-lg shadow-[#5B5FC7]/10'
                      : 'bg-[#232328] hover:bg-[#2A2A30] border-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Ringtone Icon / Indicator */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition-all flex-none ${
                        isSelected
                          ? 'bg-[#5B5FC7] text-white shadow-[#5B5FC7]/30'
                          : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-white animate-ring-wave-1 rounded-full h-full" />
                          <span className="w-1 bg-white animate-ring-wave-2 rounded-full h-3/4" />
                          <span className="w-1 bg-white animate-ring-wave-3 rounded-full h-full" />
                        </div>
                      ) : (
                        <Music className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white truncate">
                          {ringtone.name}
                        </h4>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {ringtone.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-indigo-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          {ringtone.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Preview Button + Checkmark */}
                  <div className="flex items-center gap-2 flex-none">
                    <button
                      type="button"
                      onClick={(e) => handlePlayPreview(ringtone.id, e)}
                      title={isPlaying ? 'Stop Preview' : 'Play Preview'}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informational Footer Note */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
            <div>
              <p className="text-gray-300 font-semibold">Instant Real-Time Audio</p>
              <p className="text-gray-400">
                Your selected ringtone will automatically play when incoming Microsoft Teams voice or video calls arrive. Volume is optimized for loud, crisp playback.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <footer className="px-6 py-4 bg-[#151518] border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Selected: <strong className="text-white capitalize">{currentRingtone === 'flute' ? 'Dil Ki Dhadkan Flute' : currentRingtone === 'early_riser' ? 'Early Riser' : 'Teams Classic'}</strong>
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold text-xs transition-all shadow-lg hover:shadow-[#5B5FC7]/40 cursor-pointer"
          >
            Done & Save
          </button>
        </footer>
      </div>
    </div>
  );
};
