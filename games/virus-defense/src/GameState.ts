import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export class GameState {
  public status: GameStatus;
  public score: number;
  public highScore: number;
  public wave: number;
  public combo: number;
  public comboTimer: number;
  public multiplier: number;
  public virusesDestroyed: number;
  public accuracyShotsFired: number;
  public accuracyHits: number;
  private readonly comboWindow = 1.5; // seconds
  private readonly storageKey = 'virus-defense-highscore';

  constructor() {
    this.status = 'ready';
    this.score = 0;
    this.wave = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.multiplier = 1;
    this.virusesDestroyed = 0;
    this.accuracyShotsFired = 0;
    this.accuracyHits = 0;
    this.highScore = this.loadHighScore();
  }

  public get accuracyPercentage(): number {
    if (this.accuracyShotsFired === 0) return 0;
    return Math.round((this.accuracyHits / this.accuracyShotsFired) * 100);
  }

  public start(): void {
    this.status = 'playing';
    this.score = 0;
    this.wave = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.multiplier = 1;
    this.virusesDestroyed = 0;
    this.accuracyShotsFired = 0;
    this.accuracyHits = 0;
  }

  public recordShot(): void {
    if (this.status !== 'playing') return;
    this.accuracyShotsFired++;
  }

  public recordHit(basePoints: number): void {
    if (this.status !== 'playing') return;

    this.accuracyHits++;
    this.virusesDestroyed++;
    this.combo++;
    this.comboTimer = this.comboWindow;

    // Multiplier steps: 1x (combo 1-2), 2x (3-5), 3x (6-9), 4x (10-14), 5x (15+)
    if (this.combo >= 15) {
      this.multiplier = 5;
    } else if (this.combo >= 10) {
      this.multiplier = 4;
    } else if (this.combo >= 6) {
      this.multiplier = 3;
    } else if (this.combo >= 3) {
      this.multiplier = 2;
    } else {
      this.multiplier = 1;
    }

    this.score += basePoints * this.multiplier;
  }

  public completeWave(): void {
    if (this.status !== 'playing') return;
    this.score += 500; // Wave clear bonus
    this.wave++;
  }

  public gameOver(): void {
    this.status = 'gameover';
    reportScore(this.score);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore(this.score);
    }
  }

  public togglePause(): void {
    if (this.status === 'playing') {
      this.status = 'paused';
    } else if (this.status === 'paused') {
      this.status = 'playing';
    }
  }

  public update(dt: number): void {
    if (this.status !== 'playing') return;

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.multiplier = 1;
      }
    }
  }

  private loadHighScore(): number {
    try {
      const val = loadData(this.storageKey);
      const parsed = Number(val);
      return isNaN(parsed) || !Number.isFinite(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      saveData(this.storageKey, score.toString());
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}
