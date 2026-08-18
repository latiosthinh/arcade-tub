import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export const HIGH_SCORE_KEY = 'arcade-carnival-subway-runner-highscore';

export class GameState {
  status: GameStatus = 'ready';
  score: number = 0;
  highScore: number = 0;
  distance: number = 0; // meters traveled
  coinsCollected: number = 0;

  baseSpeed: number = 420;
  currentSpeed: number = 420;
  maxSpeed: number = 950;
  speedIncrementRate: number = 12; // speed increase per sec

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
      // Ignored in test/sandbox environments
    }
  }

  startGame(): void {
    this.status = 'playing';
    this.score = 0;
    this.distance = 0;
    this.coinsCollected = 0;
    this.currentSpeed = this.baseSpeed;
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

  update(dt: number, is2xActive: boolean = false): void {
    if (this.status !== 'playing') return;

    // Speed progression
    if (this.currentSpeed < this.maxSpeed) {
      this.currentSpeed += this.speedIncrementRate * dt;
    }

    // Distance accumulation
    const distDelta = (this.currentSpeed * dt) / 10;
    this.distance += distDelta;

    // Score accumulation: distance + coin bonuses
    const scoreRate = (this.currentSpeed / 25) * (is2xActive ? 2 : 1);
    this.score += Math.floor(scoreRate * dt);

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  addCoin(is2xActive: boolean = false): void {
    this.coinsCollected += 1;
    const value = is2xActive ? 20 : 10;
    this.score += value;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.distance = 0;
    this.coinsCollected = 0;
    this.currentSpeed = this.baseSpeed;
  }
}
