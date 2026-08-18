export class CarAudio {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenTimer: number | null = null;
  private isMuted: boolean = false;
  private engineRunning: boolean = false;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.engineGain) {
      this.engineGain.gain.value = muted ? 0 : 0.08;
    }
  }

  startEngine(): void {
    if (this.engineRunning) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      this.engineOsc = ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, ctx.currentTime);

      this.engineFilter = ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(250, ctx.currentTime);

      this.engineGain = ctx.createGain();
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(ctx.destination);

      this.engineOsc.start();
      this.engineRunning = true;
    } catch {
      // AudioContext failure recovery
    }
  }

  stopEngine(): void {
    if (!this.engineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      if (this.engineFilter) {
        this.engineFilter.disconnect();
        this.engineFilter = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
    } catch {
      // Ignore
    }
    this.engineRunning = false;
  }

  updateEngineSpeed(speed: number, minSpeed: number = 100, maxSpeed: number = 350): void {
    if (!this.engineRunning || !this.ctx || !this.engineOsc || !this.engineFilter) return;

    const ratio = Math.max(0, Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed)));
    const targetFreq = 50 + ratio * 180; // 50Hz to 230Hz
    const targetFilter = 220 + ratio * 600; // 220Hz to 820Hz

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.05);
  }

  playTireScreech(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(750, ctx.currentTime + 0.16);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, ctx.currentTime);
      filter.Q.value = 5.0;

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Ignore
    }
  }

  playSlipstreamWhoosh(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      // Procedural noise burst with resonant sweep
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.25);
      filter.Q.value = 4.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch {
      // Ignore
    }
  }

  playPoliceSiren(): void {
    if (this.isMuted || this.sirenTimer !== null) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      this.sirenOsc = ctx.createOscillator();
      this.sirenGain = ctx.createGain();

      this.sirenOsc.type = 'square';
      this.sirenGain.gain.setValueAtTime(0.04, ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(ctx.destination);
      this.sirenOsc.start();

      let toggle = false;
      this.sirenTimer = window.setInterval(() => {
        if (!this.sirenOsc || !this.ctx) return;
        this.sirenOsc.frequency.setValueAtTime(
          toggle ? 650 : 920,
          this.ctx.currentTime
        );
        toggle = !toggle;
      }, 180);

      // Stop after 2 seconds automatically
      setTimeout(() => {
        this.stopPoliceSiren();
      }, 2000);
    } catch {
      // Ignore
    }
  }

  stopPoliceSiren(): void {
    if (this.sirenTimer !== null) {
      clearInterval(this.sirenTimer);
      this.sirenTimer = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {
        // Ignore
      }
      this.sirenOsc = null;
    }
  }

  playCrash(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    try {
      this.stopEngine();

      // Low frequency boom
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);

      // Noise explosion burst
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.45);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start();
    } catch {
      // Ignore
    }
  }
}
