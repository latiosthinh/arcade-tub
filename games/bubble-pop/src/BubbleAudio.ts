export class BubbleAudio {
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
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  /**
   * Generates realistic multi-layer bubble snap using dual oscillator + burst noise click with pitch randomization
   */
  public playPop(pitchVariation: number = 1.0, isGolden: boolean = false): void {
    this.checkMute();
    if (this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Layer 1: Plastic "thwip/pop" tone (Sine frequency sweep down)
    const baseFreq = isGolden ? 880 : 540;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = isGolden ? 'triangle' : 'sine';
    const startFreq = baseFreq * (0.9 + Math.random() * 0.2) * pitchVariation;
    const endFreq = (baseFreq * 0.25) * pitchVariation;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + 0.045);

    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);

    // Layer 2: High-frequency plastic membrane snap (Bandpass noise transient)
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.025);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isGolden ? 3200 : 2200, t);
      filter.Q.setValueAtTime(3.0, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(t);
      noise.stop(t + 0.026);
    } catch {}
  }

  /**
   * Plays resonant pentatonic chime arpeggios when rare golden rainbow bubbles burst
   */
  public playRainbowCascade(streak: number = 1): void {
    this.checkMute();
    if (this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Pentatonic scale starting at F#5 / A5
    const chords = [
      [587.33, 739.99, 880.0, 1174.66], // D5, F#5, A5, D6
      [659.25, 830.61, 987.77, 1318.51], // E5, G#5, B5, E6
      [783.99, 987.77, 1174.66, 1567.98], // G5, B5, D6, G6
    ];

    const chord = chords[(streak - 1) % chords.length] ?? chords[0]!;
    const now = ctx.currentTime;

    chord.forEach((freq, idx) => {
      const startTime = now + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  public playFreshSheet(): void {
    this.checkMute();
    if (this.isMuted) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.19);
  }
}

export const bubbleAudio = new BubbleAudio();
