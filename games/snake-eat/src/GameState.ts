import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

const HIGHSCORE_KEY = 'arcade-carnival-snake-eat-highscore';

export class GameState {
  status: GameStatus = 'ready';
  score: number = 0;
  highScore: number = 0;
  foodEaten: number = 0;
  goldenEaten: number = 0;

  streak: number = 0;
  streakTimer: number = 0;
  streakWindow: number = 3.5;

  constructor() {
    this.highScore = this.loadSavedHighScore();
  }

  private loadSavedHighScore(): number {
    try {
      const saved = loadData(HIGHSCORE_KEY);
      if (saved !== null && saved !== undefined) {
        const val = parseInt(String(saved), 10);
        return Number.isFinite(val) && val >= 0 ? val : 0;
      }
    } catch {
      return 0;
    }
    return 0;
  }

  private persistHighScore(): void {
    try {
      saveData(HIGHSCORE_KEY, this.highScore);
    } catch {
      // Ignore storage write errors
    }
  }

  get multiplier(): number {
    return Math.min(4, 1 + Math.floor(this.streak / 3));
  }

  startGame(): void {
    this.status = 'playing';
    this.score = 0;
    this.streak = 0;
    this.streakTimer = 0;
    this.foodEaten = 0;
    this.goldenEaten = 0;
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
      this.persistHighScore();
    }
    reportScore(this.score);
  }

  reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.streak = 0;
    this.streakTimer = 0;
    this.foodEaten = 0;
    this.goldenEaten = 0;
  }

  addFoodScore(basePoints: number, isGolden: boolean = false): number {
    const earned = basePoints * this.multiplier;
    this.score += earned;
    this.streak++;
    this.streakTimer = this.streakWindow;

    if (isGolden) {
      this.goldenEaten++;
    } else {
      this.foodEaten++;
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.persistHighScore();
    }

    return earned;
  }

  update(dt: number): void {
    if (this.status !== 'playing') return;

    if (this.streakTimer > 0) {
      this.streakTimer -= dt;
      if (this.streakTimer <= 0) {
        this.streakTimer = 0;
        this.streak = 0;
      }
    }
  }
}
