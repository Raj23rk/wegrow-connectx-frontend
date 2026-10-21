// Microsoft Teams Calling Audio Synthesizer (Web Audio API)
// Provides authentic Teams incoming ringtone, outgoing ringback tone, connection, and hangup sounds

class CallAudioService {
  constructor() {
    this.ctx = null;
    this.ringInterval = null;
    this.ringbackInterval = null;
    this.unlocked = false;
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

  // Play a single marimba/bell note with rich harmonic profile (Teams sound signature)
  playTeamsNote(freq, startTime, duration = 0.16, volume = 0.22) {
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
      harmonicGain.gain.setValueAtTime(0.2, startTime);
      osc2.connect(harmonicGain);
      harmonicGain.connect(masterGain);

      osc1.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Sharp attack, gentle sustain, natural exponential decay
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
  // Notes: C5 (523.25), D#5 (622.25), F5 (698.46), G5 (783.99), G#5 (830.61)
  playTeamsPhrase() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + 0.04;

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
      this.playTeamsNote(n.f, now + n.t, n.d);
    });
  }

  // Start continuous incoming call ringtone
  playIncomingRingtone() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.playTeamsPhrase();
    this.ringInterval = setInterval(() => {
      this.playTeamsPhrase();
    }, 3600);
  }

  stopIncomingRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
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

        // 1.2s pulse
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.06);
        gain.gain.setValueAtTime(0.07, now + 1.15);
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
    this.playTeamsNote(523.25, now, 0.12, 0.2); // C5
    this.playTeamsNote(783.99, now + 0.13, 0.22, 0.22); // G5
  }

  // Two soft descending tones when call ends
  playCallEnded() {
    this.stopAll();
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + 0.04;
    this.playTeamsNote(659.25, now, 0.12, 0.18); // E5
    this.playTeamsNote(440.00, now + 0.14, 0.22, 0.18); // A4
  }

  stopAll() {
    this.stopIncomingRingtone();
    this.stopOutgoingRingback();
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
