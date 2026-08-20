import { audio } from '@arcade-carnival/game-engine';

export class SpinnerAudio {
  private ctx: AudioContext | null = null;
  private humGain: GainNode | null = null;
  private oscBase: OscillatorNode | null = null;
  private oscHarmonic: OscillatorNode | null = null;
  private isHumming: boolean = false;

  private initHumContext(): void {
    if (typeof window === 'undefined') return;
    if (this.ctx && this.humGain) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.humGain.connect(this.ctx.destination);

      // Base low bearing frequency
      this.oscBase = this.ctx.createOscillator();
      this.oscBase.type = 'triangle';
      this.oscBase.frequency.setValueAtTime(45, this.ctx.currentTime);

      // Metallic overtone harmonic
      this.oscHarmonic = this.ctx.createOscillator();
      this.oscHarmonic.type = 'sine';
      this.oscHarmonic.frequency.setValueAtTime(135, this.ctx.currentTime);

      this.oscBase.connect(this.humGain);
      this.oscHarmonic.connect(this.humGain);

      this.oscBase.start();
      this.oscHarmonic.start();
      this.isHumming = true;
    } catch {
      // AudioContext policy or headless environment
    }
  }

  public updateHum(rpm: number, maxRpm: number = 1400): void {
    if (audio.isMuted()) {
      if (this.humGain && this.ctx) {
        this.humGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return;
    }

    if (!this.isHumming && rpm > 5) {
      this.initHumContext();
    }

    if (!this.ctx || !this.humGain || !this.oscBase || !this.oscHarmonic) return;

    if (this.ctx.state === 'suspended' && rpm > 10) {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;
    const ratio = Math.min(1.0, rpm / maxRpm);

    if (rpm < 5) {
      this.humGain.gain.setTargetAtTime(0, now, 0.05);
      return;
    }

    // Scale pitch from 40Hz to 650Hz
    const baseFreq = 40 + ratio * 580;
    const harmonicFreq = baseFreq * 2.8;

    this.oscBase.frequency.setTargetAtTime(baseFreq, now, 0.04);
    this.oscHarmonic.frequency.setTargetAtTime(harmonicFreq, now, 0.04);

    // Dynamic gain: gentle soothing hum at low speed, full whir at peak
    const targetGain = Math.min(0.22, 0.02 + ratio * 0.20);
    this.humGain.gain.setTargetAtTime(targetGain, now, 0.04);
  }

  public playSwipeWhoosh(intensity: number = 1.0): void {
    if (audio.isMuted()) return;
    this.initHumContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(380 * Math.min(2.0, intensity), now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1200 * Math.min(2.0, intensity), now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.22);

      gain.gain.setValueAtTime(0.25 * Math.min(1.5, intensity), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    } catch {
      // Ignore audio failure
    }
  }

  public playUpgradeSound(): void {
    if (audio.isMuted()) return;
    audio.playPowerup();
  }

  public playTapImpulse(): void {
    if (audio.isMuted()) return;
    audio.playClick();
  }
}

export const spinnerAudio = new SpinnerAudio();
