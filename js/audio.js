/**
 * audio.js — Procedural Ambient Audio for The Obsidian Signal
 *
 * Web Audio API-based ambient soundscape: low drone, random blips,
 * filtered white noise (wind), procedural tension heartbeat, creepy glitches,
 * metallic groans, and a celestial harmony chord resolution on Vault unlock.
 */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.noiseNode = null;
    this.noiseGain = null;
    this.noiseFilter = null;
    this.isMuted = false;
    this.isStarted = false;
    this.blipTimer = null;
    this.heartbeatTimer = null;
    this.foundCount = 0;
    this.isResolved = false;
    this._bound = {};
    this.muteBtn = null;
    this.progress = null;
    this.celestialNodes = [];
    this.noiseBuffer = null;
  }

  init(progress = null) {
    this.progress = progress;
    this.muteBtn = document.getElementById('mute-btn');
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => this.toggle());
    }

    // Register event listeners for game actions
    document.addEventListener('fragment-discovered', (e) => {
      this.setFoundCount(e.detail.total);
    });

    document.addEventListener('progress-loaded', () => {
      if (this.progress) {
        this.setFoundCount(this.progress.getFoundCount());
      }
    });

    document.addEventListener('system-glitch', () => {
      this.playGlitch(0.08, 0.2);
    });

    document.addEventListener('typing-glitch', () => {
      this.playGlitch(0.04, 0.08);
    });

    document.addEventListener('turbulence-glitch', () => {
      this.playGlitch(0.12, 0.3);
      this.playCreepyResonance();
    });

    document.addEventListener('vault-unlocked', () => {
      this.resolveToCelestial();
    });

    // Activate on first user interaction
    this._bound.activate = () => this._activate();
    document.addEventListener('click', this._bound.activate, { once: false, passive: true });
    document.addEventListener('keydown', this._bound.activate, { once: false, passive: true });
    document.addEventListener('touchstart', this._bound.activate, { once: false, passive: true });
  }

  _activate() {
    if (this.isStarted) return;
    this.isStarted = true;

    // Remove activation listeners
    document.removeEventListener('click', this._bound.activate);
    document.removeEventListener('keydown', this._bound.activate);
    document.removeEventListener('touchstart', this._bound.activate);

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return; // Web Audio not supported
    }

    // Master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : 1;
    this.masterGain.connect(this.ctx.destination);

    // Pre-create white noise buffer for glitches and wind
    this._createNoiseBuffer();

    // Start background generators
    if (this.progress && this.progress.state && this.progress.state.vault_unlocked) {
      // If already unlocked, play resolved chords directly
      this.isResolved = true;
      this._playCelestialChords();
    } else {
      this._createDrone();
      this._createWindNoise();
      this._scheduleBlip();
      this.setFoundCount(this.progress ? this.progress.getFoundCount() : 0);
    }
  }

  _createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
  }

  // ─── Low-Frequency Drone ──────────────────────────────────

  _createDrone() {
    if (this.isResolved) return;
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.04; // Very low
    this.droneGain.connect(this.masterGain);

    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.value = 60; // ~60Hz

    // Add a subtle second oscillator for depth
    const drone2 = this.ctx.createOscillator();
    drone2.type = 'sine';
    drone2.frequency.value = 61.8; // Golden ratio beating effect
    const drone2Gain = this.ctx.createGain();
    drone2Gain.gain.value = 0.025;
    drone2.connect(drone2Gain);
    drone2Gain.connect(this.masterGain);
    drone2.start();

    this.droneOsc.connect(this.droneGain);
    this.droneOsc.start();

    // Track secondary drone oscillator so we can stop it if resolved
    this.celestialNodes.push(drone2);
  }

  // ─── Wind-like Filtered White Noise ───────────────────────

  _createWindNoise() {
    if (this.isResolved || !this.noiseBuffer) return;

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = this.noiseBuffer;
    this.noiseNode.loop = true;

    // Bandpass filter to make it sound like wind
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 400;
    this.noiseFilter.Q.value = 0.5;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.012; // Very quiet

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    this.noiseNode.start();

    // Slowly modulate the filter frequency for organic feel
    this._modulateWind();
  }

  _modulateWind() {
    if (!this.ctx || !this.noiseFilter || this.isResolved) return;
    const now = this.ctx.currentTime;
    this.noiseFilter.frequency.setValueAtTime(this.noiseFilter.frequency.value, now);
    this.noiseFilter.frequency.linearRampToValueAtTime(300 + Math.random() * 300, now + 8);
    this.noiseFilter.frequency.linearRampToValueAtTime(200 + Math.random() * 150, now + 16);
    this.noiseFilter.frequency.linearRampToValueAtTime(400 + Math.random() * 200, now + 24);

    setTimeout(() => this._modulateWind(), 24000);
  }

  // ─── Random High-Frequency Blips ──────────────────────────

  _scheduleBlip() {
    if (this.isResolved) return;
    const delay = 12000 + Math.random() * 18000; // 12–30s
    this.blipTimer = setTimeout(() => {
      this._playBlip();
      this._scheduleBlip();
    }, delay);
  }

  _playBlip() {
    if (!this.ctx || this.isMuted || this.isResolved) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1500 + Math.random() * 2500; // 1500–4000 Hz
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.015, now + 0.04);
    gain.gain.linearRampToValueAtTime(0, now + 0.1 + Math.random() * 0.2);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // ─── Procedural Heartbeat ─────────────────────────────────

  setFoundCount(count) {
    this.foundCount = count;
    if (!this.isStarted || this.isResolved) return;

    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (count > 0 && count < 9) {
      this._scheduleHeartbeat();
    }
  }

  _scheduleHeartbeat() {
    if (!this.isStarted || this.isResolved || this.foundCount === 0 || this.foundCount >= 9) return;

    // Heartbeat interval gets faster as progress increases (1 to 8 fragments)
    // 0 = silent
    // 1 = 2000ms (30 bpm)
    // 8 = 650ms (92 bpm)
    const minInterval = 650;
    const maxInterval = 2000;
    const interval = maxInterval - ((this.foundCount - 1) / 7) * (maxInterval - minInterval);

    this.heartbeatTimer = setTimeout(() => {
      this._playHeartbeatCycle();
      this._scheduleHeartbeat();
    }, interval);
  }

  _playHeartbeatCycle() {
    if (!this.ctx || this.isMuted || this.isResolved) return;

    const now = this.ctx.currentTime;

    // We increase heartbeat loudness slightly as anxiety increases
    const baseVolume = 0.08 + (this.foundCount / 8) * 0.07;

    // 1st Thud (Lub)
    this._playThud(60, 20, 0.08, baseVolume, now);

    // 2nd Thud (Dub) after a short delay
    this._playThud(52, 16, 0.10, baseVolume * 0.7, now + 0.22);
  }

  _playThud(startFreq, endFreq, duration, volume, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  // ─── Play Sound FX ────────────────────────────────────────

  playGlitch(volume = 0.08, duration = 0.15) {
    if (!this.ctx || this.isMuted || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600 + Math.random() * 2000;
    filter.Q.value = 2.5;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration + 0.05);
  }

  playCreepyResonance() {
    if (!this.ctx || this.isMuted || this.isResolved) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 1.2);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(650, now + 0.5);
    filter.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    filter.Q.value = 6.0;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // ─── Celestial Chord Resolution ───────────────────────────

  resolveToCelestial() {
    this.isResolved = true;
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    if (this.blipTimer) clearTimeout(this.blipTimer);

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Fade out drone and wind
    if (this.droneGain) {
      this.droneGain.gain.linearRampToValueAtTime(0, now + 2.0);
    }
    if (this.noiseGain) {
      this.noiseGain.gain.linearRampToValueAtTime(0, now + 2.0);
    }

    this._playCelestialChords();
  }

  _playCelestialChords() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // E Major 9 chord frequencies: E3 (164.81), G#3 (207.65), B3 (246.94), D#4 (311.13), F#4 (369.99)
    const chordFrequencies = [164.81, 207.65, 246.94, 311.13, 369.99];

    // Master celestial gain
    const celestialMasterGain = this.ctx.createGain();
    celestialMasterGain.gain.setValueAtTime(0, now);
    celestialMasterGain.gain.linearRampToValueAtTime(0.08, now + 3.0); // Slow fade-in
    celestialMasterGain.connect(this.masterGain);

    chordFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400 + idx * 80;
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      // Stagger entry of chord notes
      const noteDelay = idx * 0.4;
      gain.gain.setValueAtTime(0, now + noteDelay);
      gain.gain.linearRampToValueAtTime(0.035, now + noteDelay + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(celestialMasterGain);
      osc.start(now);

      this.celestialNodes.push(osc);
      this.celestialNodes.push(gain);
    });

    // Start a slow filter shimmer (shimmer LFO)
    this._shimmerCelestialFilter(celestialMasterGain);
  }

  _shimmerCelestialFilter(masterGainNode) {
    if (!this.ctx || this.celestialNodes.length === 0) return;
    // Modulate overall gain slightly for spacey shimmer
    const now = this.ctx.currentTime;
    masterGainNode.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.04, now + 4);

    setTimeout(() => this._shimmerCelestialFilter(masterGainNode), 4000);
  }

  // ─── Public API ────────────────────────────────────────────

  mute() {
    this.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    }
    this._updateMuteButton();
  }

  unmute() {
    this.isMuted = false;
    if (!this.isStarted) {
      this._activate();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.1);
    }
    this._updateMuteButton();
  }

  toggle() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  _updateMuteButton() {
    if (!this.muteBtn) return;
    this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
    this.muteBtn.setAttribute('aria-label', this.isMuted ? 'Unmute audio' : 'Mute audio');
  }

  destroy() {
    if (this.blipTimer) clearTimeout(this.blipTimer);
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    if (this.droneOsc) this.droneOsc.stop();
    if (this.noiseNode) this.noiseNode.stop();
    this.celestialNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    if (this.ctx) this.ctx.close();
  }
}
