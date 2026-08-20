const STORAGE_KEY = 'arcade-carnival-muted';

export class CrushAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;

  // Continuous motor / hiss nodes
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private hissSource: AudioBufferSourceNode | null = null;
  private hissFilter: BiquadFilterNode | null = null;
  private hissGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isHissRunning: boolean = false;

  constructor() {
    this.muted = this.readMuteStorage();
  }

  private readMuteStorage(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(STORAGE_KEY);
        return item === 'true';
      }
    } catch {
      // Ignore
    }
    return false;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(muted));
      }
    } catch {
      // Ignore
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create 2-second looped noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public startPistonHiss(pressureRatio: number = 0): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || !this.noiseBuffer || this.isHissRunning) return;

    const now = ctx.currentTime;

    // 1. Motor Hum (60Hz -> 90Hz)
    this.humOsc = ctx.createOscillator();
    this.humGain = ctx.createGain();
    this.humOsc.type = 'sawtooth';
    this.humOsc.frequency.setValueAtTime(55 + pressureRatio * 35, now);
    this.humGain.gain.setValueAtTime(0.01, now);
    this.humGain.gain.linearRampToValueAtTime(0.12, now + 0.1);

    this.humOsc.connect(this.humGain);
    this.humGain.connect(this.masterGain);
    this.humOsc.start(now);

    // 2. Filtered Steam Hiss (Bandpass white noise)
    this.hissSource = ctx.createBufferSource();
    this.hissSource.buffer = this.noiseBuffer;
    this.hissSource.loop = true;

    this.hissFilter = ctx.createBiquadFilter();
    this.hissFilter.type = 'bandpass';
    this.hissFilter.frequency.setValueAtTime(800 + pressureRatio * 1500, now);
    this.hissFilter.Q.setValueAtTime(3.0, now);

    this.hissGain = ctx.createGain();
    this.hissGain.gain.setValueAtTime(0.01, now);
    this.hissGain.gain.linearRampToValueAtTime(0.08 + pressureRatio * 0.15, now + 0.1);

    this.hissSource.connect(this.hissFilter);
    this.hissFilter.connect(this.hissGain);
    this.hissGain.connect(this.masterGain);
    this.hissSource.start(now);

    this.isHissRunning = true;
  }

  public updatePistonAudio(pressureRatio: number, isCompressing: boolean): void {
    if (!this.isHissRunning || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.humOsc && this.humGain) {
      this.humOsc.frequency.setTargetAtTime(55 + pressureRatio * 45, now, 0.05);
      this.humGain.gain.setTargetAtTime(isCompressing ? 0.1 + pressureRatio * 0.08 : 0.05, now, 0.05);
    }

    if (this.hissFilter && this.hissGain) {
      this.hissFilter.frequency.setTargetAtTime(800 + pressureRatio * 1600, now, 0.05);
      this.hissGain.gain.setTargetAtTime(isCompressing ? 0.08 + pressureRatio * 0.16 : 0.03, now, 0.05);
    }
  }

  public stopPistonAudio(): void {
    if (!this.isHissRunning || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.humGain) {
      this.humGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    }
    if (this.hissGain) {
      this.hissGain.gain.linearRampToValueAtTime(0.001, now + 0.15);
    }

    setTimeout(() => {
      try {
        if (this.humOsc) {
          this.humOsc.stop();
          this.humOsc.disconnect();
          this.humOsc = null;
        }
        if (this.hissSource) {
          this.hissSource.stop();
          this.hissSource.disconnect();
          this.hissSource = null;
        }
      } catch {
        // Safe disconnect
      }
      this.isHissRunning = false;
    }, 160);
  }

  public playCrushBurst(soundProfile: 'squish' | 'crunch' | 'metallic' | 'glass'): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Sub-bass thud (45Hz down to 20Hz)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, now);
    subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    subGain.gain.setValueAtTime(0.6, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.4);

    if (soundProfile === 'squish') {
      // Wet squelch sweep
      const squishOsc = ctx.createOscillator();
      const squishGain = ctx.createGain();
      squishOsc.type = 'triangle';
      squishOsc.frequency.setValueAtTime(450, now);
      squishOsc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
      squishGain.gain.setValueAtTime(0.4, now);
      squishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      squishOsc.connect(squishGain);
      squishGain.connect(this.masterGain);
      squishOsc.start(now);
      squishOsc.stop(now + 0.25);
    } else if (soundProfile === 'crunch' || soundProfile === 'metallic') {
      // High metallic/crunch noise burst
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = soundProfile === 'metallic' ? 'highpass' : 'bandpass';
        filter.frequency.setValueAtTime(soundProfile === 'metallic' ? 1800 : 900, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.28);
      }
    } else if (soundProfile === 'glass') {
      // High pitch metallic ping
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(1400, now);
      pingOsc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      pingGain.gain.setValueAtTime(0.35, now);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      pingOsc.connect(pingGain);
      pingGain.connect(this.masterGain);
      pingOsc.start(now);
      pingOsc.stop(now + 0.3);
    }
  }

  public playClick(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const crushAudio = new CrushAudio();
