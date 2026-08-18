import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export const HIGH_SCORE_KEY = 'arcade-carnival-car-race-highscore';

export class GameState {
  status: GameStatus = 'ready';
  score: number = 0;
  highScore: number = 0;
  distance: number = 0; // in meters
  carsDodged: number = 0;
  draftTime: number = 0; // seconds
  topSpeed: number = 100;
  speedMultiplier: number = 1.0;
  draftMultiplier: number = 1.0;

  constructor() {
    this.loadHighScore();
  }

  loadHighScore(): void {
    try {
      const saved = loadData(HIGH_SCORE_KEY);
      const parsed = Number(saved);
      this.highScore = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch {
      this.highScore = 0;
    }
  }

  saveHighScore(): void {
    try {
      saveData(HIGH_SCORE_KEY, String(this.highScore));
      reportScore(this.highScore);
    } catch {
      // Ignored in headless/unsupported test environments
    }
  }

  startGame(): void {
    this.status = 'playing';
    this.score = 0;
    this.distance = 0;
    this.carsDodged = 0;
    this.draftTime = 0;
    this.topSpeed = 100;
  }

  pause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    }
  }

  resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  endGame(): void {
    this.status = 'gameover';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  update(dt: number, playerSpeed: number, isDrafting: boolean): void {
    if (this.status !== 'playing') return;

    if (playerSpeed > this.topSpeed) {
      this.topSpeed = playerSpeed;
    }

    // Distance accumulation: speed (km/h) -> m/s * dt
    const metersPerSec = (playerSpeed * 1000) / 3600;
    this.distance += metersPerSec * dt;

    // Multipliers
    // 100 km/h = 1.0x, 350 km/h = 2.5x
    this.speedMultiplier = 1.0 + ((playerSpeed - 100) / 250) * 1.5;
    this.draftMultiplier = isDrafting ? 2.0 : 1.0;

    if (isDrafting) {
      this.draftTime += dt;
    }

    // Score accumulation: speed * multipliers
    const scoreRate = (playerSpeed / 10) * this.speedMultiplier * this.draftMultiplier;
    this.score += Math.floor(scoreRate * dt);

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  addDodgedCar(count: number = 1): void {
    this.carsDodged += count;
    // Flat bonus per car passed based on speed multiplier
    this.score += count * Math.floor(25 * this.speedMultiplier);
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.distance = 0;
    this.carsDodged = 0;
    this.draftTime = 0;
    this.topSpeed = 100;
    this.speedMultiplier = 1.0;
    this.draftMultiplier = 1.0;
  }
}
