import { AudioSynthesizer } from '@arcade-carnival/game-engine';

export class BattleAudio {
  private synth: AudioSynthesizer;
  private isMuted: boolean = false;

  constructor() {
    this.synth = new AudioSynthesizer();
  }

  public playSFX(name: string): void {
    if (this.isMuted) return;

    switch (name) {
      case 'tap':
        this.synth.playTone(320, 0.05, 'triangle', 0.15);
        break;
      case 'countdown':
        this.synth.playTone(440, 0.08, 'sine', 0.2);
        break;
      case 'whistle':
        this.synth.playSweep(580, 880, 0.25, 'sine', 0.25);
        break;
      case 'cheer':
        this.synth.playFanfare();
        break;
      case 'fanfare':
        this.synth.playVictory();
        break;
      case 'draw':
        this.synth.playTone(220, 0.3, 'sawtooth', 0.2);
        break;
      case 'pop':
        this.synth.playSweep(800, 200, 0.08, 'triangle', 0.3);
        break;
      case 'cannon':
        this.synth.playNoise(0.2, 0.4);
        break;
      default:
        this.synth.playClick();
        break;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}
