export class DriftAudio {
  private ctx: AudioContext | null = null;
  private driftGain: GainNode | null = null;
  private driftOsc: OscillatorNode | null = null;
  private isDrifting = false;

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startDriftSqueal(): void {
    if (this.isDrifting) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.driftOsc = this.ctx.createOscillator();
      this.driftGain = this.ctx.createGain();

      this.driftOsc.type = 'sawtooth';
      this.driftOsc.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.driftOsc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.1);

      this.driftGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.driftGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);

      this.driftOsc.connect(this.driftGain);
      this.driftGain.connect(this.ctx.destination);
      this.driftOsc.start();
      this.isDrifting = true;
    } catch {
      // Audio error / policy restriction
    }
  }

  public stopDriftSqueal(): void {
    if (!this.isDrifting || !this.ctx || !this.driftGain || !this.driftOsc) {
      this.isDrifting = false;
      return;
    }
    try {
      this.driftGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      const osc = this.driftOsc;
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      }, 50);
    } catch {
      // ignore
    }
    this.isDrifting = false;
  }

  public playCoinChime(): void {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  public playCardboardCrash(): void {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  public playJumpWhoosh(): void {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.25);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }
}
