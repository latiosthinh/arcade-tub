/**
 * Procedural ASMR Sand Audio Synthesizer
 * Generates continuous falling sand whisper, crystalline pentatonic chimes, and rake friction audio.
 */
export class SandAudio {
  private ctx: AudioContext | null = null;
  private isMutedState: boolean = false;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private lastChimeTime: number = 0;

  // Pentatonic scale frequencies: C4, D4, E4, G4, A4, C5, D5, E5, G5
  private chimeFreqs = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

  private initCtx(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupNoiseGenerator();
      }
    } catch {
      // Ignore audio failure if unsupported or blocked
    }
  }

  private setupNoiseGenerator(): void {
    if (!this.ctx) return;

    // Create 2-second pink-like textured noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.08;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    // Bandpass filter for gentle sand granular hiss
    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 1800;
    this.noiseFilter.Q.value = 1.2;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.0;

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.ctx.destination);

    this.noiseNode.start(0);
  }

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
    if (this.noiseGain && this.ctx) {
      if (muted) {
        this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    }
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public updateMovingGrains(movingCount: number): void {
    if (this.isMutedState) return;
    this.initCtx();
    if (!this.ctx || !this.noiseGain || !this.noiseFilter) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Scale noise gain with moving sand volume
    const targetGain = Math.min(0.25, (movingCount / 400) * 0.25);
    const targetFreq = 1200 + Math.min(1800, movingCount * 5);

    const now = this.ctx.currentTime;
    this.noiseGain.gain.setTargetAtTime(targetGain, now, 0.08);
    this.noiseFilter.frequency.setTargetAtTime(targetFreq, now, 0.1);
  }

  public triggerChime(intensity = 1.0): void {
    if (this.isMutedState) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastChimeTime < 0.12) return; // Prevent spam
    this.lastChimeTime = now;

    const freq = this.chimeFreqs[Math.floor(Math.random() * this.chimeFreqs.length)] ?? 440;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const baseVol = 0.06 * intensity;
    gain.gain.setValueAtTime(baseVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  public triggerRakeScrape(): void {
    if (this.isMutedState) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.value = 600;

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public stop(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
    }
  }
}

export const sandAudio = new SandAudio();
