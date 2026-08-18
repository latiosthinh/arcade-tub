export class SnakeAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;

  constructor() {
    this.readMuteStorage();
  }

  private readMuteStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        this.muted = localStorage.getItem('arcade-carnival-muted') === 'true';
      }
    } catch {
      this.muted = false;
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('arcade-carnival-muted', String(muted));
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  }

  public playTurn(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.03);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playEat(multiplier: number = 1): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 480 + (multiplier - 1) * 90;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playGoldenPickup(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  public playCrash(): void {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}

export const snakeAudio = new SnakeAudio();
