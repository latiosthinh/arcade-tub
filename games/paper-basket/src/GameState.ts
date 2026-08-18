import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  public static readonly HIGH_SCORE_KEY = 'arcade-carnival-paper-basket-highscore';

  public status: GameStatus = 'ready';
  public score: number = 0;
  public basketsScored: number = 0;
  public swishStreak: number = 0;
  public highScore: number = 0;
  public gameOverReason: 'floor' | 'timeout' | null = null;

  constructor() {
    this.loadHighScore();
  }

  public startGame(): boolean {
    if (this.status === 'playing') return false;
    this.status = 'playing';
    this.score = 0;
    this.basketsScored = 0;
    this.swishStreak = 0;
    this.gameOverReason = null;
    return true;
  }

  public pause(): boolean {
    if (this.status !== 'playing') return false;
    this.status = 'paused';
    return true;
  }

  public resume(): boolean {
    if (this.status !== 'paused') return false;
    this.status = 'playing';
    return true;
  }

  public addScore(isSwish: boolean): { points: number; streak: number } {
    if (this.status !== 'playing') return { points: 0, streak: 0 };

    this.basketsScored++;
    if (isSwish) {
      this.swishStreak++;
    } else {
      this.swishStreak = 0;
    }

    const multiplier = isSwish ? Math.min(4, 1 + this.swishStreak) : 1;
    const points = (isSwish ? 2 : 1) * 100 * multiplier;
    this.score += points;

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    return { points, streak: this.swishStreak };
  }

  public endGame(reason: 'floor' | 'timeout'): boolean {
    if (this.status !== 'playing') return false;
    this.status = 'gameover';
    this.gameOverReason = reason;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    reportScore(this.score);
    return true;
  }

  public reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.basketsScored = 0;
    this.swishStreak = 0;
    this.gameOverReason = null;
  }

  private loadHighScore(): void {
    try {
      const stored = loadData(GameState.HIGH_SCORE_KEY);
      if (stored) {
        const val = Number(stored);
        this.highScore = Number.isFinite(val) && val >= 0 ? val : 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  private saveHighScore(): void {
    try {
      saveData(GameState.HIGH_SCORE_KEY, String(this.highScore));
    } catch {
      // Ignored
    }
  }
}
