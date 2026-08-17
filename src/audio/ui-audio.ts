const STORAGE_KEY = 'arcade-carnival-muted';

export class UIAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;

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
      // Ignore storage access errors
    }
    return false;
  }

  private persistMuteStorage(value: boolean): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(value));
      }
    } catch {
      // Ignore storage access errors
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.persistMuteStorage(muted);
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
      } catch {
        // Safe gain update
      }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Snappy button click feedback (sine wave 800Hz -> 400Hz).
   */
  public playClick(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Gentle high-pitch hover blip (1200Hz -> 1800Hz, 30ms).
   */
  public playHover(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.linearRampToValueAtTime(1800, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.03);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Ascending frequency sweep swoosh for game launch (220Hz -> 880Hz, 200ms).
   */
  public playLaunch(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Smooth chord / filter swell for view transitions (440Hz -> 660Hz).
   */
  public playTransition(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.12);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * CRT scanline degauss pop blip (150Hz -> 50Hz with noise pop).
   */
  public playCrtToggle(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.08);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Error sound feedback.
   */
  public playError(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.18);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    } catch {}
  }

  /**
   * Success / victory sound feedback.
   */
  public playSuccess(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + 0.1);

        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        };
      });
    } catch {}
  }
}

// ponytail: UI Web Audio singleton handles all arcade UI sound effects without external audio assets.
export const uiAudio = new UIAudioSynthesizer();
