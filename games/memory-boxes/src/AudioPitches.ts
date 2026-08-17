export class TonePlayer {
  private _ctx: AudioContext | null = null;
  private _masterGain: GainNode | null = null;
  private _isMuted = false;

  constructor() {
    this._checkMute();
  }

  private _checkMute(): void {
    if (typeof localStorage !== 'undefined') {
      this._isMuted = localStorage.getItem('arcade-carnival-muted') === 'true';
    }
  }

  private _ensureContext(): boolean {
    this._checkMute();
    if (this._isMuted) return false;

    if (!this._ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return false;
      this._ctx = new AudioCtxClass();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.setValueAtTime(0.18, this._ctx.currentTime);
      this._masterGain.connect(this._ctx.destination);
    }

    if (this._ctx.state === 'suspended') {
      this._ctx.resume().catch(() => {});
    }

    return true;
  }

  public playTone(frequency: number, duration: number = 0.28): void {
    if (!this._ensureContext() || !this._ctx || !this._masterGain) return;

    try {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      const now = this._ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(Math.max(20, frequency), now);

      // Smooth attack and release envelope to prevent click artifacts
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this._masterGain);

      osc.start(now);
      osc.stop(now + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Audio autoplay policy or device failure gracefully ignored
    }
  }

  public playError(): void {
    if (!this._ensureContext() || !this._ctx || !this._masterGain) return;

    try {
      const osc = this._ctx.createOscillator();
      const gain = this._ctx.createGain();
      const now = this._ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now); // Low A2 buzz
      osc.frequency.linearRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this._masterGain);

      osc.start(now);
      osc.stop(now + 0.35);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {}
  }

  public playRoundComplete(): void {
    if (!this._ensureContext() || !this._ctx) return;

    const triad = [440, 554.37, 659.25, 880]; // A major arpeggio flourish
    triad.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2);
      }, index * 80);
    });
  }

  public playGameOver(): void {
    if (!this._ensureContext() || !this._ctx) return;

    const notes = [330, 311.13, 293.66, 261.63];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.25);
      }, index * 120);
    });
  }
}
