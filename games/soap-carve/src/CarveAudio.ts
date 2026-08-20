export class CarveAudio {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isScraping = false;
  private isMuted = false;

  constructor() {
    this.checkMuteState();
  }

  private checkMuteState(): void {
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
        localStorage.setItem('arcade-carnival-muted', muted ? 'true' : 'false');
      }
    } catch {
      // Ignore
    }
    if (this.isMuted) {
      this.stopScrape();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startScrape(speed = 1.0, depth = 1): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.isScraping) {
      this.updateScrape(speed, depth);
      return;
    }

    try {
      // 1. Create looping noise buffer (pink/brown noise for waxy scrape texture)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Resonant bandpass filter to capture metallic cutter / crisp wax slicing
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setValueAtTime(1200 + speed * 1500, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(3.5, this.ctx.currentTime);

      this.gainNode = this.ctx.createGain();
      const targetGain = Math.min(0.25, 0.04 + speed * 0.08 + depth * 0.02);
      this.gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.noiseNode.start();
      this.isScraping = true;
    } catch {
      // Audio context may not be allowed before user interaction
    }
  }

  public updateScrape(speed = 1.0, depth = 1): void {
    if (!this.isScraping || !this.filterNode || !this.gainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    const targetFreq = Math.min(6000, 800 + speed * 2500);
    const targetGain = Math.min(0.28, 0.04 + speed * 0.1 + depth * 0.02);

    this.filterNode.frequency.setTargetAtTime(targetFreq, now, 0.05);
    this.gainNode.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  public stopScrape(): void {
    if (!this.isScraping || !this.gainNode || !this.ctx) {
      this.isScraping = false;
      return;
    }

    try {
      const now = this.ctx.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      const nodeToStop = this.noiseNode;
      setTimeout(() => {
        try {
          nodeToStop?.stop();
          nodeToStop?.disconnect();
        } catch {
          // Ignore
        }
      }, 90);
    } catch {
      // Ignore
    }

    this.noiseNode = null;
    this.filterNode = null;
    this.gainNode = null;
    this.isScraping = false;
  }

  public playCurlSnap(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }

  public playDiscoveryChime(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Pentatonic music box arpeggio: C5, E5, G5, B5, C6
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const noteTime = now + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    });
  }
}

export const carveAudio = new CarveAudio();
