export class PopItAudio {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  constructor() {
    this.checkMute();
  }

  private checkMute(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        this.isMuted = localStorage.getItem('arcade-carnival-muted') === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('arcade-carnival-muted', String(muted));
      }
    } catch {}
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    this.checkMute();
    return this.isMuted;
  }

  private initCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  /**
   * Synthesized tactile silicone rubber pop.
   * Front press: deep hollow 'plop' (sine with rapid downward frequency sweep 350Hz -> 80Hz + resonant low-pass filter).
   * Reverse press: crisper sharper snap (higher frequency sweep 520Hz -> 140Hz + higher cutoff).
   */
  public playPop(isFlipped: boolean = false, pitchVariation: number = 1.0): void {
    this.checkMute();
    if (this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = isFlipped ? 'triangle' : 'sine';

    const baseStartFreq = isFlipped ? 520 : 350;
    const baseEndFreq = isFlipped ? 140 : 80;
    const randomDetune = 0.95 + Math.random() * 0.1;
    const startFreq = baseStartFreq * randomDetune * pitchVariation;
    const endFreq = baseEndFreq * randomDetune * pitchVariation;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isFlipped ? 1800 : 900, t);
    filter.Q.setValueAtTime(isFlipped ? 4.0 : 2.5, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);

    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Sweeping filtered noise whoosh for 3D board flip
   */
  public playFlipWhoosh(): void {
    this.checkMute();
    if (this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    try {
      const duration = 0.25;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(250, t + duration);
      filter.Q.setValueAtTime(2.0, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
      noise.stop(t + duration);
    } catch {}
  }

  /**
   * Relaxing triumphant harmonic pentatonic chime when entire board is cleared
   */
  public playClearChime(): void {
    this.checkMute();
    if (this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    const now = ctx.currentTime;

    chord.forEach((freq, idx) => {
      const startTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.62);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }
}

export const popItAudio = new PopItAudio();
