import { saveData, loadData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';
export type MedalTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

const STORAGE_KEY = 'flappy-fish-highscore';

export class GameState {
  status: GameStatus = 'ready';
  score: number = 0;
  pearls: number = 0;
  highScore: number = 0;
  medal: MedalTier = 'none';

  constructor() {
    this.loadHighScore();
  }

  get totalScore(): number {
    return this.score + this.pearls * 3;
  }

  start(): void {
    this.status = 'playing';
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

  addScore(amount: number = 1): void {
    this.score += amount;
  }

  addPearls(amount: number = 1): void {
    this.pearls += amount;
  }

  gameOver(): void {
    this.status = 'gameover';
    this.calculateMedal();

    const finalTotal = this.totalScore;
    if (finalTotal > this.highScore) {
      this.highScore = finalTotal;
      this.saveHighScore();
    }
    reportScore(finalTotal);
  }

  private calculateMedal(): void {
    const total = this.totalScore;
    if (total >= 100) {
      this.medal = 'platinum';
    } else if (total >= 50) {
      this.medal = 'gold';
    } else if (total >= 25) {
      this.medal = 'silver';
    } else if (total >= 10) {
      this.medal = 'bronze';
    } else {
      this.medal = 'none';
    }
  }

  reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.pearls = 0;
    this.medal = 'none';
  }

  private loadHighScore(): void {
    try {
      const saved = loadData(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        this.highScore = isNaN(parsed) ? 0 : parsed;
      } else {
        this.highScore = 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  private saveHighScore(): void {
    try {
      saveData(STORAGE_KEY, this.highScore.toString());
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}
