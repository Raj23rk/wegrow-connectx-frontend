// Microsoft Teams Calling Audio & Ringtone Service
// Supports rich MP3 ringtones (Dil Ki Dhadkan Flute, Early Riser) and classic synthesized Teams chime

import fluteRingtone from '../Dil_Ki_Dhadkan_Flute-658726-mobiles24 (1).mp3';
import earlyRiserRingtone from '../EarlyRiser.mp3';

export const RINGTONE_LIST = [
  {
    id: 'flute',
    name: 'Dil Ki Dhadkan (Flute)',
    tag: 'Bollywood Flute • High Volume',
    description: 'Soulful Bollywood flute melody, clear and loud',
    src: fluteRingtone || '/sounds/Dil_Ki_Dhadkan_Flute.mp3',
    type: 'audio'
  },
  {
    id: 'early_riser',
    name: 'Early Riser',
    tag: 'Acoustic Marimba • High Volume',
    description: 'Energetic acoustic bell melody with crisp rhythm',
    src: earlyRiserRingtone || '/sounds/EarlyRiser.mp3',
    type: 'audio'
  },
  {
    id: 'teams_classic',
    name: 'Microsoft Teams Classic',
    tag: 'Authentic Teams Chime',
    description: 'Original Teams synthesized marimba signature',
    src: null,
    type: 'synth'
  }
];

class CallAudioService {
  constructor() {
    this.ctx = null;
    this.ringInterval = null;
    this.ringbackInterval = null;
    this.unlocked = false;
    this.audioElement = null;
    this.previewAudio = null;
    this.currentRingtone = typeof localStorage !== 'undefined'
      ? (localStorage.getItem('connectx_ringtone') || 'flute')
      : 'flute';
    this.volume = typeof localStorage !== 'undefined'
      ? parseFloat(localStorage.getItem('connectx_ringtone_volume') || '1.0')
      : 1.0;
  }

  getAudioContext() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlock() {
    if (this.unlocked) return;
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'running') {
        this.unlocked = true;
      }
    } catch (e) {
      // ignore
    }
  }

  getRingtone() {
    return this.currentRingtone;
  }

  setRingtone(id) {
    this.currentRingtone = id;
    try {
      localStorage.setItem('connectx_ringtone', id);
    } catch (e) {}

    // If currently ringing on an incoming call, smoothly switch ringtone in real-time
    if (this.isRinging()) {
      this.playIncomingRingtone(id);
    }
  }

  getVolume() {
    return this.volume;
  }

  setVolume(vol) {
    this.volume = Math.min(1.0, Math.max(0, vol));
    try {
      localStorage.setItem('connectx_ringtone_volume', String(this.volume));
    } catch (e) {}

    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
    if (this.previewAudio) {
      this.previewAudio.volume = this.volume;
    }
  }

  isRinging() {
    return !!(this.ringInterval || (this.audioElement && !this.audioElement.paused));
  }

  // Play a single marimba/bell note with rich harmonic profile (Teams sound signature)
  playTeamsNote(freq, startTime, duration = 0.16, volume = 0.45) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const masterGain = ctx.createGain();

      // Fundamental frequency
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      // 2nd harmonic (octave overtone for vibrant bell/marimba tone)
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.25, startTime);
      osc2.connect(harmonicGain);
      harmonicGain.connect(masterGain);

      osc1.connect(masterGain);
      masterGain.connect(ctx.destination);

      // High volume attack, gentle sustain, natural exponential decay
      masterGain.gain.setValueAtTime(0.0001, startTime);
      masterGain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.05);
      osc2.stop(startTime + duration + 0.05);
    } catch (err) {
      console.warn('[CallAudio] Error playing note:', err.message);
    }
  }

  // Plays one phrase of Microsoft Teams incoming call ringtone
  playTeamsPhrase(volMultiplier = 1.0) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + 0.04;
    const highVol = 0.45 * Math.min(1.0, Math.max(0.1, volMultiplier));

    const melody = [
      { f: 523.25, t: 0.00, d: 0.14 }, // C5
      { f: 622.25, t: 0.16, d: 0.14 }, // D#5
      { f: 698.46, t: 0.32, d: 0.14 }, // F5
      { f: 783.99, t: 0.48, d: 0.16 }, // G5
      { f: 830.61, t: 0.66, d: 0.22 }, // G#5
      { f: 783.99, t: 0.92, d: 0.15 }, // G5
      { f: 698.46, t: 1.09, d: 0.15 }, // F5
      { f: 622.25, t: 1.26, d: 0.26 }, // D#5

      { f: 523.25, t: 1.62, d: 0.14 }, // C5
      { f: 622.25, t: 1.78, d: 0.14 }, // D#5
      { f: 698.46, t: 1.94, d: 0.20 }, // F5
      { f: 622.25, t: 2.16, d: 0.20 }, // D#5
      { f: 523.25, t: 2.38, d: 0.38 }  // C5
    ];

    melody.forEach(n => {
      this.playTeamsNote(n.f, now + n.t, n.d, highVol);
    });
  }

  // Start continuous incoming call ringtone
  playIncomingRingtone(ringtoneId = null) {
    this.stopIncomingRingtone();
    this.stopPreview();

    const id = ringtoneId || this.currentRingtone || 'flute';
    const ringtone = RINGTONE_LIST.find(r => r.id === id) || RINGTONE_LIST[0];

    // If Teams Classic synthesizer
    if (ringtone.type === 'synth') {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      this.playTeamsPhrase(this.volume);
      this.ringInterval = setInterval(() => {
        this.playTeamsPhrase(this.volume);
      }, 3600);
      return;
    }

    // Play MP3 audio ringtone at High Volume
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
      }
      this.audioElement.src = ringtone.src;
      this.audioElement.loop = true;
      this.audioElement.volume = Math.min(1.0, Math.max(0.1, this.volume));

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('[CallAudio] HTML5 Audio autoplay failed, falling back to synth:', err.message);
          this.playTeamsPhrase(this.volume);
          this.ringInterval = setInterval(() => {
            this.playTeamsPhrase(this.volume);
          }, 3600);
        });
      }
    } catch (err) {
      console.warn('[CallAudio] Error in audio playback:', err);
    }
  }

  stopIncomingRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) {}
    }
  }

  // Preview a ringtone in settings
  previewRingtone(ringtoneId) {
    this.stopPreview();
    const ringtone = RINGTONE_LIST.find(r => r.id === ringtoneId) || RINGTONE_LIST[0];

    if (ringtone.type === 'synth') {
      const ctx = this.getAudioContext();
      if (ctx) {
        this.playTeamsPhrase(this.volume);
      }
      return;
    }

    try {
      if (!this.previewAudio) {
        this.previewAudio = new Audio();
      }
      this.previewAudio.src = ringtone.src;
      this.previewAudio.currentTime = 0;
      this.previewAudio.volume = Math.min(1.0, Math.max(0.1, this.volume));
      this.previewAudio.play().catch(e => {
        console.warn('[CallAudio] Preview play error:', e);
      });
    } catch (e) {
      console.warn('[CallAudio] Error starting preview:', e);
    }
  }

  stopPreview() {
    if (this.previewAudio) {
      try {
        this.previewAudio.pause();
        this.previewAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  // Outgoing ringback tone: dual-frequency chime ("tuuut... tuuut...")
  playOutgoingRingback() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const playTone = () => {
      try {
        const now = ctx.currentTime + 0.05;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Standard pleasant telephone ringback tone (440Hz + 480Hz)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        // 1.2s pulse with high volume
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
        gain.gain.setValueAtTime(0.12, now + 1.15);
        gain.gain.linearRampToValueAtTime(0.0001, now + 1.25);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);
      } catch (err) {
        console.warn('[CallAudio] Error in ringback tone:', err.message);
      }
    };

    playTone();
    this.ringbackInterval = setInterval(playTone, 3400);
  }

  stopOutgoingRingback() {
    if (this.ringbackInterval) {
      clearInterval(this.ringbackInterval);
      this.ringbackInterval = null;
    }
  }

  // Two ascending soft tones when call connects
  playCallConnected() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + 0.04;
    this.playTeamsNote(523.25, now, 0.12, 0.35); // C5
    this.playTeamsNote(783.99, now + 0.13, 0.22, 0.38); // G5
  }

  // Two soft descending tones when call ends
  playCallEnded() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + 0.04;
    this.playTeamsNote(659.25, now, 0.12, 0.30); // E5
    this.playTeamsNote(440.00, now + 0.14, 0.22, 0.30); // A4
  }

  stopAll() {
    this.stopIncomingRingtone();
    this.stopOutgoingRingback();
    this.stopPreview();
  }
}

export const callAudio = new CallAudioService();

// Auto-unlock audio context on any user touch/click
if (typeof window !== 'undefined') {
  const handleInteraction = () => {
    callAudio.unlock();
  };
  window.addEventListener('click', handleInteraction, { passive: true });
  window.addEventListener('keydown', handleInteraction, { passive: true });
}
