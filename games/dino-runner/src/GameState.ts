import { loadData, saveData } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  public status: GameStatus = 'ready';
  public score: number = 0;
  public highScore: number = 0;
  public distanceTraveled: number = 0;
  public currentSpeed: number = 360;
  public baseSpeed: number = 360;
  public maxSpeed: number = 880;
  
  // Day / Night cycle progression (0 = day, 0.5 = dusk, 1 = night)
  public dayNightCycle: number = 0;
  public isNight: boolean = false;
  public milestonePending: boolean = false;
  private lastMilestone: number = 0;

  constructor() {
    this.highScore = this.loadHighScore();
  }

  private loadHighScore(): number {
    try {
      const val = loadData('dino-runner-highscore');
      if (val) {
        const parsed = parseInt(val, 10);
        if (!Number.isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return 0;
  }

  public saveHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        saveData('dino-runner-highscore', String(this.highScore));
      } catch {
        // Ignore storage error
      }
    }
  }

  public reset(): void {
    this.status = 'playing';
    this.score = 0;
    this.distanceTraveled = 0;
    this.currentSpeed = this.baseSpeed;
    this.dayNightCycle = 0;
    this.isNight = false;
    this.milestonePending = false;
    this.lastMilestone = 0;
  }

  public pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  public gameOver(): void {
    this.status = 'gameover';
    this.saveHighScore();
  }

  public update(dt: number): void {
    if (this.status !== 'playing') return;

    // Advance distance
    const distDelta = this.currentSpeed * dt * 0.05;
    this.distanceTraveled += distDelta;
    this.score = Math.floor(this.distanceTraveled);

    // Speed progression: gradually accelerate as distance grows
    const speedRamp = Math.min(this.maxSpeed, this.baseSpeed + Math.sqrt(this.distanceTraveled) * 14);
    this.currentSpeed = speedRamp;

    // Day / Night cycle flips every 600 points / distance
    const cyclePos = (this.distanceTraveled % 1200) / 1200;
    this.dayNightCycle = cyclePos;
    this.isNight = cyclePos >= 0.5;

    // Check for 100-point milestone chime
    const currentHundreds = Math.floor(this.score / 100) * 100;
    if (currentHundreds > 0 && currentHundreds > this.lastMilestone) {
      this.lastMilestone = currentHundreds;
      this.milestonePending = true;
    }
  }
}
