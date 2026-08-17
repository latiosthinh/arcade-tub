import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface MatchScoreResult {
  pointsAwarded: number;
  streak: number;
  multiplier: number;
}

export class GameState {
  public static readonly ROUND_DURATION = 60.0;
  public static readonly BASE_MATCH_SCORE = 500;
  public static readonly TIME_BONUS_PER_SEC = 100;
  public static readonly STORAGE_KEY = 'memory-cards-highscore';

  public score: number = 0;
  public highScore: number = 0;
  public timeRemaining: number = GameState.ROUND_DURATION;
  public streak: number = 0;
  public flipAttempts: number = 0;
  public status: GameStatus = 'ready';

  constructor() {
    const raw = loadData(GameState.STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.highScore = parsed;
      }
    }
  }

  public get comboMultiplier(): number {
    return 1 + this.streak * 0.5;
  }

  public start(): void {
    this.score = 0;
    this.timeRemaining = GameState.ROUND_DURATION;
    this.streak = 0;
    this.flipAttempts = 0;
    this.status = 'playing';
  }

  public recordMatch(): MatchScoreResult {
    this.flipAttempts++;
    this.streak++;
    const multiplier = this.comboMultiplier;
    const pointsAwarded = Math.round(GameState.BASE_MATCH_SCORE * multiplier);
    this.score += pointsAwarded;

    return {
      pointsAwarded,
      streak: this.streak,
      multiplier,
    };
  }

  public recordMismatch(): void {
    this.flipAttempts++;
    this.streak = 0;
  }

  public checkWin(allMatched: boolean): boolean {
    if (this.status !== 'playing') {
      return false;
    }

    if (allMatched) {
      const timeBonus = Math.round(this.timeRemaining * GameState.TIME_BONUS_PER_SEC);
      this.score += timeBonus;
      this.status = 'victory';
      this.finalizeGame();
      return true;
    }

    return false;
  }

  public update(dt: number): void {
    if (this.status !== 'playing') {
      return;
    }

    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    this.timeRemaining = Math.max(0, this.timeRemaining - safeDt);

    if (this.timeRemaining <= 0) {
      this.status = 'gameover';
      this.finalizeGame();
    }
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

  public restart(): void {
    this.start();
  }

  private finalizeGame(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveData(GameState.STORAGE_KEY, String(this.highScore));
    }
    reportScore(this.score);
  }
}
