// =============================================
// CHESS+ ROGUELIKE: AUDIO MANAGER
// High-Quality MP3 BGM System & Procedural SFX Engine
// =============================================

'use strict';

class SoundManager {
  constructor() {
    this.tracks = {
      tavern: {
        src: 'assets/audio/tavern.mp3',
        title: 'Tavern Theme',
        loop: true,
        baseVol: 0.6
      }
    };

    this.currentTrackKey = null;
    this.currentAudio = null;
    this.fadeInterval = null;
    this.audioCtx = null;
    this.isMuted = localStorage.getItem('chess_music_muted') === 'true';
    this.volume = parseFloat(localStorage.getItem('chess_music_volume') || '0.5');
    this.hasInteracted = false;
    this.pendingTrack = 'tavern';

    this.initAudioElements();
    this.bindUserGesture();
    this.bindKeyboardShortcut();
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended' && this.hasInteracted) {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  initAudioElements() {
    this.audioPool = {};
    for (const [key, conf] of Object.entries(this.tracks)) {
      const audio = new Audio();
      audio.src = conf.src;
      audio.loop = conf.loop;
      audio.preload = 'auto';
      audio.volume = 0;
      this.audioPool[key] = audio;
    }
  }

  bindUserGesture() {
    const unlock = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;
      this.getAudioContext();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);

      // Play pending track once user interacts with page
      if (this.pendingTrack && !this.isMuted) {
        this.play(this.pendingTrack);
      }
    };

    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  bindKeyboardShortcut() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'm' || e.key === 'M') {
        this.toggleMute();
      }
    });
  }

  play(trackKey = 'tavern') {
    const key = 'tavern';
    if (!this.hasInteracted) {
      this.pendingTrack = key;
      return;
    }

    // If tavern is already playing, let it continue seamlessly
    if (this.currentAudio && !this.currentAudio.paused) {
      return;
    }

    const nextAudio = this.audioPool[key];
    if (!nextAudio) return;

    this.currentAudio = nextAudio;
    this.currentTrackKey = key;
    this.currentAudio.volume = this.isMuted ? 0 : this.volume * (this.tracks[key].baseVol || 0.6);
    this.currentAudio.play().catch(() => {});
    this.updateUI();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('chess_music_volume', this.volume.toString());
    if (this.currentAudio && !this.isMuted) {
      this.currentAudio.volume = this.volume * 0.6;
    }
    this.updateUI();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('chess_music_muted', this.isMuted.toString());

    if (this.isMuted) {
      if (this.currentAudio) this.currentAudio.volume = 0;
    } else {
      if (!this.hasInteracted) {
        this.hasInteracted = true;
      }
      if (this.currentAudio) {
        this.currentAudio.volume = this.volume * 0.6;
        if (this.currentAudio.paused) {
          this.currentAudio.play().catch(() => {});
        }
      } else {
        this.play('tavern');
      }
    }
    this.updateUI();
  }

  initUIListeners() {
    const btn = document.getElementById('btnMusicToggle');
    const slider = document.getElementById('musicVolumeSlider');

    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }

    if (slider) {
      slider.value = Math.round(this.volume * 100);
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        if (this.isMuted && val > 0) {
          this.isMuted = false;
          localStorage.setItem('chess_music_muted', 'false');
        }
        this.setVolume(val);
      });
      slider.addEventListener('click', (e) => e.stopPropagation());
    }

    this.updateUI();
  }

  updateUI() {
    const btn = document.getElementById('btnMusicToggle');
    const icon = document.getElementById('musicIcon');
    const slider = document.getElementById('musicVolumeSlider');
    const widget = document.getElementById('musicWidget');

    if (icon) {
      icon.textContent = this.isMuted || this.volume === 0 ? '🔇' : (this.volume < 0.4 ? '🔉' : '🔊');
    }
    if (btn) {
      btn.classList.toggle('music-muted', this.isMuted || this.volume === 0);
      btn.title = this.isMuted
        ? 'Unmute Music (Press M)'
        : `Mute Music (Press M) — Vol: ${Math.round(this.volume * 100)}%`;
    }
    if (slider) {
      slider.value = this.isMuted ? 0 : Math.round(this.volume * 100);
    }
    if (widget) {
      widget.title = 'BGM: Tavern Theme (Press M to toggle)';
    }
  }

  // =============================================
  // PROCEDURAL SOUND EFFECTS (SFX) ENGINE
  // Zero latency, high fidelity Web Audio synthesis
  // =============================================

  playSfx(type) {
    if (this.isMuted || this.volume === 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const sfxVol = Math.max(0.1, Math.min(1.0, this.volume * 1.1));
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(sfxVol, now);
      masterGain.connect(ctx.destination);

      switch (type) {
        case 'move': {
          // Satisfying crisp wooden chess piece placement & solid tactile thud (Louder, punchier & richer)
          // 1. Wood impact transient crack (tiếng "cạch" gỗ đanh giòn, rõ ràng)
          const bufferSize = Math.floor(ctx.sampleRate * 0.055);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const bandpass = ctx.createBiquadFilter();
          bandpass.type = 'bandpass';
          bandpass.frequency.setValueAtTime(1450, now);
          bandpass.Q.setValueAtTime(2.2, now);
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(1.15, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          noise.connect(bandpass);
          bandpass.connect(noiseGain);
          noiseGain.connect(masterGain);
          noise.start(now);

          // 2. High-frequency crisp snap (tiếng gõ nảy dứt khoát)
          const snapOsc = ctx.createOscillator();
          const snapGain = ctx.createGain();
          snapOsc.type = 'triangle';
          snapOsc.frequency.setValueAtTime(640, now);
          snapOsc.frequency.exponentialRampToValueAtTime(190, now + 0.04);
          snapGain.gain.setValueAtTime(0.9, now);
          snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          snapOsc.connect(snapGain);
          snapGain.connect(masterGain);
          snapOsc.start(now);
          snapOsc.stop(now + 0.05);

          // 3. Resonant wooden board body knock (tiếng "cộp / thịch" đầm ấm, to rõ trên mọi loa)
          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'sine';
          bodyOsc.frequency.setValueAtTime(260, now);
          bodyOsc.frequency.exponentialRampToValueAtTime(95, now + 0.12);
          bodyGain.gain.setValueAtTime(1.2, now);
          bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          bodyOsc.connect(bodyGain);
          bodyGain.connect(masterGain);
          bodyOsc.start(now);
          bodyOsc.stop(now + 0.13);
          break;
        }

        case 'slash': {
          // Quick blade whoosh / swing
          const bufferSize = Math.floor(ctx.sampleRate * 0.11);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(3400, now);
          filter.frequency.exponentialRampToValueAtTime(550, now + 0.11);
          filter.Q.setValueAtTime(2.6, now);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          noise.start(now);
          break;
        }

        case 'hit': {
          // Punchy physical strike impact with noise burst
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(170, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.13);
          oscGain.gain.setValueAtTime(0.75, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(950, now);
          filter.frequency.exponentialRampToValueAtTime(160, now + 0.13);

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.14);

          const bufferSize = Math.floor(ctx.sampleRate * 0.05);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.65, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          noise.connect(nGain);
          nGain.connect(masterGain);
          noise.start(now);
          break;
        }

        case 'kill': {
          // Heavy piece shatter / defeat explosion
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(130, now);
          osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);
          oscGain.gain.setValueAtTime(1.0, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(850, now);
          filter.frequency.exponentialRampToValueAtTime(70, now + 0.28);

          osc.connect(filter);
          filter.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.3);

          const bufferSize = Math.floor(ctx.sampleRate * 0.22);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const nGain = ctx.createGain();
          nGain.gain.setValueAtTime(0.75, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          noise.connect(nGain);
          nGain.connect(masterGain);
          noise.start(now);
          break;
        }

        case 'arrow': {
          // Bow release & flying arrow whistle
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(920, now);
          osc.frequency.exponentialRampToValueAtTime(240, now + 0.16);
          oscGain.gain.setValueAtTime(0.65, now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.17);
          break;
        }

        case 'reflect': {
          // Spike Shield metallic deflection ping (crystalline metallic ringing)
          [1760, 2640, 3520].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime((0.55 / (idx + 1)), now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.23);
          });
          break;
        }

        case 'revive': {
          // Radiant Phoenix ascending shimmer (C5, E5, G5, C6, E6)
          const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
          notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.055;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.45, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + 0.3);
          });
          break;
        }

        case 'coin': {
          // Golden crystalline coin chime (B5 -> E6)
          const notes = [
            { freq: 987.77, delay: 0, dur: 0.07 },
            { freq: 1318.51, delay: 0.065, dur: 0.26 }
          ];
          notes.forEach(n => {
            const noteTime = now + n.delay;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, noteTime);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.5, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + n.dur + 0.02);
          });
          break;
        }

        case 'magic': {
          // Mystical talisman sparkle shimmer
          const notes = [739.99, 932.33, 1108.73, 1479.98];
          notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.045;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteTime);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.42, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + 0.22);
          });
          break;
        }

        case 'socket': {
          // Arcane socket rune lock: crystalline chime + tactile latch snap
          const snapOsc = ctx.createOscillator();
          const snapGain = ctx.createGain();
          snapOsc.type = 'triangle';
          snapOsc.frequency.setValueAtTime(820, now);
          snapOsc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
          snapGain.gain.setValueAtTime(0.7, now);
          snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          snapOsc.connect(snapGain);
          snapGain.connect(masterGain);
          snapOsc.start(now);
          snapOsc.stop(now + 0.05);

          const notes = [
            { freq: 1046.50, delay: 0.03, dur: 0.22 },
            { freq: 1567.98, delay: 0.09, dur: 0.35 }
          ];
          notes.forEach(n => {
            const noteTime = now + n.delay;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, noteTime);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.55, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + n.dur + 0.02);
          });
          break;
        }

        case 'mutate': {
          // Dark Transmutation: sinister cosmic warp sweep
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sawtooth';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(220, now);
          osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.28);
          osc2.frequency.setValueAtTime(225, now);
          osc2.frequency.exponentialRampToValueAtTime(622.25, now + 0.28);
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.48, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.35);
          osc2.stop(now + 0.35);
          break;
        }

        case 'promote': {
          // Grand herald fanfare for Queen promotion
          const notes = [
            { freq: 392.00, delay: 0.00, dur: 0.12 },
            { freq: 523.25, delay: 0.10, dur: 0.12 },
            { freq: 659.25, delay: 0.20, dur: 0.14 },
            { freq: 783.99, delay: 0.32, dur: 0.45 }
          ];
          notes.forEach(n => {
            const noteTime = now + n.delay;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.freq, noteTime);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.5, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + n.dur + 0.05);
          });
          break;
        }

        case 'defeat': {
          // Somber minor chord descent
          const notes = [
            { freq: 293.66, delay: 0.00, dur: 0.25 },
            { freq: 233.08, delay: 0.22, dur: 0.25 },
            { freq: 196.00, delay: 0.44, dur: 0.25 },
            { freq: 146.83, delay: 0.66, dur: 0.50 }
          ];
          notes.forEach(n => {
            const noteTime = now + n.delay;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, noteTime);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.setValueAtTime(0.45, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + n.dur + 0.05);
          });
          break;
        }

        case 'click': {
          // Tactile UI click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1100, now);
          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'earthquake': {
          // Low rumbling tremor for shaking chessboard tiles
          const bufferSize = Math.floor(ctx.sampleRate * 0.45);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.8));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const lowpass = ctx.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.setValueAtTime(140, now);
          lowpass.frequency.linearRampToValueAtTime(60, now + 0.4);
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.8, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          noise.connect(lowpass);
          lowpass.connect(noiseGain);
          noiseGain.connect(masterGain);
          noise.start(now);
          break;
        }

        case 'collapse': {
          // Deep crashing rockfall into the void
          const bufferSize = Math.floor(ctx.sampleRate * 0.55);
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(220, now);
          filter.frequency.exponentialRampToValueAtTime(40, now + 0.5);
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.9, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(masterGain);
          noise.start(now);
          break;
        }

        default:
          break;
      }
    } catch (e) {
      // AudioContext safe failover
    }
  }
}

// Global instance
window.soundManager = new SoundManager();
