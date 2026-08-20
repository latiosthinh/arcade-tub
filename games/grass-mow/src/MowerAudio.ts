export class MowerAudio {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isInitialized = false;
  private isMuted = false;

  public init(): void {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Main 2-stroke engine sawtooth
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

      // Low frequency rumble modulation
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'square';
      this.subOsc.frequency.setValueAtTime(20, this.ctx.currentTime);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(15, this.ctx.currentTime);
      this.subOsc.connect(subGain);
      subGain.connect(this.engineOsc.frequency);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.subOsc.start();

      // Noise generator for cutting tall grass
      this.initNoiseGenerator();

      this.isInitialized = true;
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  private initNoiseGenerator(): void {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    this.noiseGain.connect(filter);
    filter.connect(this.ctx.destination);

    // Loop noise node
    const createNoiseSource = () => {
      if (!this.ctx || !this.noiseGain) return;
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;
      this.noiseNode.connect(this.noiseGain);
      this.noiseNode.start();
    };

    createNoiseSource();
  }

  public updateEngine(speedRatio: number, isCutting: boolean): void {
    if (!this.isInitialized || !this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const targetFreq = 75 + speedRatio * 90; // 75Hz idle to 165Hz full speed
    this.engineOsc?.frequency.setTargetAtTime(targetFreq, t, 0.05);

    const targetEngineGain = 0.04 + speedRatio * 0.06;
    this.engineGain?.gain.setTargetAtTime(targetEngineGain, t, 0.05);

    const targetNoiseGain = isCutting ? 0.08 : 0.0;
    this.noiseGain?.gain.setTargetAtTime(targetNoiseGain, t, 0.03);
  }

  public playLevelComplete(): void {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + i * 0.12);

      gain.gain.setValueAtTime(0, startTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, startTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime + i * 0.12);
      osc.stop(startTime + i * 0.12 + 0.65);
    });
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.engineGain && this.noiseGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.isMuted;
  }
}

export const mowerAudio = new MowerAudio();
