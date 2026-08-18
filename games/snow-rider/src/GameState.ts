import { loadData, saveData } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  public status: GameStatus = 'ready';
  public distance: number = 0;
  public giftsCollected: number = 0;
  public score: number = 0;
  public highScore: number = 0;
  
  public currentSpeed: number = 280;
  public baseSpeed: number = 280;
  public maxSpeed: number = 720;
  public speedMultiplier: number = 1.0;

  constructor() {
    this.highScore = this.loadHighScore();
  }

  private loadHighScore(): number {
    try {
      const val = loadData('snow-rider-highscore');
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
        saveData('snow-rider-highscore', String(this.highScore));
      } catch {
        // Ignore storage error
      }
    }
  }

  public reset(): void {
    this.status = 'playing';
    this.distance = 0;
    this.giftsCollected = 0;
    this.score = 0;
    this.currentSpeed = this.baseSpeed;
    this.speedMultiplier = 1.0;
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

  public collectGift(): void {
    this.giftsCollected++;
    this.score += 50;
    this.saveHighScore();
  }

  public gameOver(): void {
    this.status = 'gameover';
    this.saveHighScore();
  }

  public update(dt: number): void {
    if (this.status !== 'playing') return;

    // Advance distance
    const distDelta = this.currentSpeed * dt * 0.1;
    this.distance += distDelta;

    // Gradual acceleration down the snowy slope
    this.speedMultiplier = Math.min(this.maxSpeed / this.baseSpeed, 1 + Math.sqrt(this.distance) * 0.04);
    this.currentSpeed = this.baseSpeed * this.speedMultiplier;

    this.score = Math.floor(this.distance) + this.giftsCollected * 50;
    this.saveHighScore();
  }
}
