import { loadData, saveData, reportScore } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'levelcleared' | 'gameover';

export class GameState {
  public score: number = 0;
  public highScore: number = 0;
  public lives: number = 3;
  public maxLives: number = 5;
  public level: number = 1;
  public status: GameStatus = 'ready';

  constructor() {
    const saved = loadData('brick-blitz-highscore');
    if (saved !== null) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed)) {
        this.highScore = parsed;
      }
    }
  }

  public start(): void {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.status = 'playing';
  }

  public addScore(pts: number): void {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  public addLife(): void {
    this.lives = Math.min(this.maxLives, this.lives + 1);
  }

  public loseLife(): void {
    this.lives = Math.max(0, this.lives - 1);
    if (this.lives <= 0) {
      this.status = 'gameover';
      saveData('brick-blitz-highscore', String(this.highScore));
      reportScore(this.score);
    }
  }

  public completeLevel(): void {
    this.addScore(500);
    this.level++;
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
}
