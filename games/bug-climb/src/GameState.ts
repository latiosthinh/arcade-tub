import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';
export type GameOverReason = 'collision' | 'timeout' | null;

export class GameState {
  public static readonly HIGH_SCORE_KEY = 'arcade-carnival-bug-climb-highscore';
  public static readonly STREAK_WINDOW = 0.8;

  public status: GameStatus = 'ready';
  public score = 0;
  public altitude = 0;
  public stepsClimbed = 0;
  public highScore = 0;

  public streak = 0;
  public streakTimer = 0;
  public multiplier = 1;

  public gameOverReason: GameOverReason = null;

  constructor() {
    this.loadHighScore();
  }

  public startGame(): boolean {
    if (this.status === 'playing') return false;
    this.status = 'playing';
    this.score = 0;
    this.altitude = 0;
    this.stepsClimbed = 0;
    this.streak = 0;
    this.streakTimer = 0;
    this.multiplier = 1;
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

  public endGame(reason: 'collision' | 'timeout'): boolean {
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

  public addClimbScore(): number {
    if (this.status !== 'playing') return 0;

    this.stepsClimbed++;
    this.altitude++;
    this.streak++;
    this.streakTimer = GameState.STREAK_WINDOW;

    this.multiplier = 1 + Math.min(4, Math.floor(this.streak / 5));
    const points = 10 * this.multiplier;
    this.score += points;

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    return points;
  }

  public update(dt: number): void {
    if (this.status !== 'playing') return;

    if (this.streakTimer > 0) {
      this.streakTimer = Math.max(0, this.streakTimer - dt);
      if (this.streakTimer === 0) {
        this.streak = 0;
        this.multiplier = 1;
      }
    }
  }

  public reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.altitude = 0;
    this.stepsClimbed = 0;
    this.streak = 0;
    this.streakTimer = 0;
    this.multiplier = 1;
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
