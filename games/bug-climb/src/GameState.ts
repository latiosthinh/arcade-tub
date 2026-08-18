import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  public static readonly HIGH_SCORE_KEY = 'arcade-carnival-bug-climb-highscore';

  public status: GameStatus = 'ready';
  public score = 0;
  public altitude = 0;
  public branchesDodged = 0;
  public highScore = 0;
  public multiplier = 1;

  constructor() {
    this.loadHighScore();
  }

  public startGame(): boolean {
    if (this.status === 'playing') return false;
    this.status = 'playing';
    this.score = 0;
    this.altitude = 0;
    this.branchesDodged = 0;
    this.multiplier = 1;
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

  public endGame(): boolean {
    if (this.status !== 'playing') return false;
    this.status = 'gameover';

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      this.saveHighScore();
    }
    reportScore(Math.floor(this.score));
    return true;
  }

  public addDodgedBranches(count: number = 1): void {
    if (this.status !== 'playing') return;
    this.branchesDodged += count;
    this.score += 50 * count * this.multiplier;
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
    }
  }

  public update(dt: number, climberSpeed: number): void {
    if (this.status !== 'playing') return;

    // Altitude in meters climbed
    const climbDelta = (climberSpeed * dt) / 25;
    this.altitude += climbDelta;

    // Continuous score increment from speed
    this.multiplier = 1 + Math.min(3, Math.floor(climberSpeed / 120));
    this.score += (climberSpeed / 10) * dt * this.multiplier;

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
    }
  }

  public reset(): void {
    this.status = 'ready';
    this.score = 0;
    this.altitude = 0;
    this.branchesDodged = 0;
    this.multiplier = 1;
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
      saveData(GameState.HIGH_SCORE_KEY, String(Math.floor(this.highScore)));
    } catch {
      // Ignored
    }
  }
}
