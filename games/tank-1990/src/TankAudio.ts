/**
 * TankAudio is a zero-asset procedural 8-bit Web Audio synthesizer for Tank 1990.
 * It produces retro chiptune sound effects dynamically without audio files:
 * - Engine idle and moving low-frequency drone
 * - Player and enemy cannon fire bursts
 * - Bullet-on-bullet mid-air metallic pings
 * - Brick crumb crackles and steel deflection clangs
 * - Tank and base explosion blasts
 * - Powerup spawns and pickups
 * - Eagle destruction alarm siren
 * - Retro stage start fanfare and game over cadence
 *
 * All channels are routed through a master DynamicsCompressorNode to prevent clipping.
 */
export class TankAudio {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public compressor: DynamicsCompressorNode | null = null;
  public muted: boolean = false;

  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private engineIsMoving: boolean = false;
  private cachedNoiseBuffer: AudioBuffer | null = null;
  private cachedNoiseDuration: number = 0;

  constructor() {
    // AudioContext will be lazily initialized on first user interaction
  }

  /**
   * Initializes or returns the existing AudioContext.
   * Safe for non-browser/headless environments and respects autoplay policies.
   */
  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioCtxClass) {
        return null;
      }

      try {
        this.ctx = new AudioCtxClass();

        // Configure master DynamicsCompressorNode (VISUAL-05)
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        // Master gain control
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0.0 : 0.6, this.ctx.currentTime);

        // Connect master routing: masterGain -> compressor -> destination
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        return null;
      }
    }

    // Attempt to resume suspended AudioContext on user interaction
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignored if autoplay policy blocks
      });
    }

    return this.ctx;
  }

  public init(): void {
    this.ensureContext();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0.0 : 0.6;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.03);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0.0, Math.min(1.0, volume));
      if (!this.muted) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.setValueAtTime(clamped * 0.6, this.ctx.currentTime);
      }
    }
  }

  /**
   * Helper to create a noise audio buffer for crunchy impact/explosion synthesis.
   */
  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.cachedNoiseBuffer && this.cachedNoiseDuration >= duration) {
      return this.cachedNoiseBuffer;
    }
    const sampleRate = this.ctx.sampleRate || 44100;
    const targetDuration = Math.max(duration, 1.0);
    const frameCount = Math.floor(sampleRate * targetDuration);
    const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.cachedNoiseBuffer = buffer;
    this.cachedNoiseDuration = targetDuration;
    return buffer;
  }

  /**
   * Cannon shot pop (Square wave frequency drop).
   * Player shot is slightly higher pitched (600Hz -> 80Hz in 0.08s) than enemy shot (480Hz -> 70Hz).
   */
  public playShot(isPlayer: boolean = true): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isPlayer ? 'square' : 'triangle';
      const startFreq = isPlayer ? 620 : 480;
      const endFreq = isPlayer ? 80 : 60;
      const duration = 0.09;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Metallic high triangle ping for mid-air bullet collisions (1200Hz -> 900Hz in 0.04s).
   */
  public playBulletPing(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const duration = 0.045;

      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + duration);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Crunchy cardboard/brick chipping sound.
   */
  public playBrickHit(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.08;

      // Low frequency square crunch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + duration);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);

      // Add noise crackle layer
      const noiseBuffer = this.createNoiseBuffer(duration);
      if (noiseBuffer) {
        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        noise.buffer = noiseBuffer;

        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + duration);

        noise.onended = () => {
          noise.disconnect();
          noiseGain.disconnect();
        };
      }

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Resonant metallic clang for steel deflection (dual oscillators: 880Hz square + 1320Hz sine).
   */
  public playSteelHit(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const duration = 0.12;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + duration);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(660, now + duration);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      osc1.onended = () => {
        osc1.disconnect();
        osc2.disconnect();
        gain.disconnect();
      };
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Explosion blast sound (downward sweep + white noise rumble).
   */
  public playExplosion(isBig: boolean = false): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const duration = isBig ? 0.6 : 0.35;

      // Low pitch down-sweep
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sawtooth';
      const startFreq = isBig ? 140 : 180;
      const endFreq = isBig ? 20 : 30;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      oscGain.gain.setValueAtTime(isBig ? 0.5 : 0.35, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);

      // Noise blast layer
      const noiseBuffer = this.createNoiseBuffer(duration);
      if (noiseBuffer) {
        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        noise.buffer = noiseBuffer;

        noiseGain.gain.setValueAtTime(isBig ? 0.45 : 0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + duration);

        noise.onended = () => {
          noise.disconnect();
          noiseGain.disconnect();
        };
      }

      osc.onended = () => {
        osc.disconnect();
        oscGain.disconnect();
      };
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * 2-note arpeggio (C5 -> G5) announcing powerup item drop.
   */
  public playPowerupSpawn(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 783.99]; // C5, G5
      const noteDuration = 0.08;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * noteDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Triumphant 4-note ascending chiptune jingle (C5 -> E5 -> G5 -> C6).
   */
  public playPowerupPickup(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const noteDuration = 0.06;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * noteDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.28, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Alternating 2-tone alarm siren + heavy explosion boom for HQ base loss.
   */
  public playEagleDestroyed(): void {
    this.playExplosion(true);

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const pulses = [440, 330, 440, 330, 440, 330];
      const pulseDuration = 0.1;

      pulses.forEach((freq, idx) => {
        const startTime = now + idx * pulseDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + pulseDuration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + pulseDuration);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Stage intro fanfare (Battle City 10-note opening theme).
   */
  public playStageStartFanfare(): void {
    this.playStageStart();
  }

  public playStageStart(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      // D4, F#4, A4, D5, A4, F#4, G4, B4, D5, G5
      const melody = [
        { freq: 293.66, dur: 0.1 },
        { freq: 369.99, dur: 0.1 },
        { freq: 440.0, dur: 0.1 },
        { freq: 587.33, dur: 0.2 },
        { freq: 440.0, dur: 0.1 },
        { freq: 369.99, dur: 0.1 },
        { freq: 392.0, dur: 0.1 },
        { freq: 493.88, dur: 0.1 },
        { freq: 587.33, dur: 0.1 },
        { freq: 783.99, dur: 0.35 },
      ];

      let elapsed = 0;
      melody.forEach((note) => {
        const startTime = now + elapsed;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + note.dur);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };

        elapsed += note.dur;
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Descending melancholy 4-note cadence on game over (G4 -> Eb4 -> C4 -> G3).
   */
  public playGameOver(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [392.0, 311.13, 261.63, 196.0]; // G4, Eb4, C4, G3
      const noteDuration = 0.2;

      notes.forEach((freq, idx) => {
        const startTime = now + idx * noteDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);

        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      });
    } catch {
      // Ignore audio synthesis errors
    }
  }

  /**
   * Sound effect aliases for consistent subsystem naming.
   */
  public playPlayerFire(): void {
    this.playShot(true);
  }

  public playEnemyFire(): void {
    this.playShot(false);
  }

  public playTankExplosion(isBig?: boolean): void {
    this.playExplosion(isBig);
  }

  public playBulletHitMetal(): void {
    this.playSteelHit();
  }

  public playBrickDestroy(): void {
    this.playBrickHit();
  }

  public playBulletCancel(): void {
    this.playBulletPing();
  }

  public playGameOverCadence(): void {
    this.playGameOver();
  }

  public playPowerUpPickup(): void {
    this.playPowerupPickup();
  }

  public playPowerUpSpawn(): void {
    this.playPowerupSpawn();
  }

  /**
   * Updates or starts continuous engine hum (idle vs moving).
   */
  public updateEngineSound(isMoving: boolean): void {
    this.startEngine(isMoving);
  }

  /**
   * Continuous engine hum (45Hz idle, 65Hz moving).
   */
  public startEngine(isMoving: boolean = false): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    try {
      const targetFreq = isMoving ? 65 : 45;
      const targetGain = isMoving ? 0.08 : 0.04;

      if (!this.isEngineRunning || !this.engineOsc || !this.engineGain) {
        const now = ctx.currentTime;
        this.engineOsc = ctx.createOscillator();
        this.engineGain = ctx.createGain();

        this.engineOsc.type = 'triangle';
        this.engineOsc.frequency.setValueAtTime(targetFreq, now);

        this.engineGain.gain.setValueAtTime(0.001, now);
        this.engineGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);

        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineOsc.start(now);
        this.isEngineRunning = true;
        this.engineIsMoving = isMoving;
      } else {
        // Smoothly adjust frequency and volume
        if (this.engineIsMoving !== isMoving) {
          const now = ctx.currentTime;
          this.engineOsc.frequency.cancelScheduledValues(now);
          this.engineGain.gain.cancelScheduledValues(now);

          this.engineOsc.frequency.setValueAtTime(this.engineOsc.frequency.value, now);
          this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, now);

          this.engineOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.05);
          this.engineGain.gain.linearRampToValueAtTime(targetGain, now + 0.05);
          this.engineIsMoving = isMoving;
        }
      }
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Stops the continuous engine sound.
   */
  public stopEngine(): void {
    if (!this.isEngineRunning || !this.engineOsc || !this.engineGain || !this.ctx) {
      this.isEngineRunning = false;
      this.engineOsc = null;
      this.engineGain = null;
      return;
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.engineOsc;
      const gain = this.engineGain;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      osc.stop(now + 0.06);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Ignore errors
    } finally {
      this.isEngineRunning = false;
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  /**
   * Cleans up all audio context resources.
   */
  public destroy(): void {
    this.stopEngine();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // Ignore errors
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.cachedNoiseBuffer = null;
  }
}
