import { loadData, reportScore, saveData } from '@arcade-carnival/playables-adapter';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';
export type GameOverReason = 'time_up' | 'shields_breached' | null;

export class GameState {
  status: GameStatus = 'ready';
  roundDuration: number = 60;
  timeRemaining: number = 60;
  shields: number = 3;
  maxShields: number = 3;
  score: number = 0;
  highScore: number = 0;
  wordsDestroyed: number = 0;
  gameOverReason: GameOverReason = null;

  constructor() {
    const saved = loadData('type-strike-highscore');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.highScore = parsed;
      }
    }
  }

  start(): void {
    this.status = 'playing';
    this.timeRemaining = this.roundDuration;
    this.shields = this.maxShields;
    this.score = 0;
    this.wordsDestroyed = 0;
    this.gameOverReason = null;
  }

  update(dt: number): void {
    if (this.status !== 'playing') return;

    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    if (this.timeRemaining <= 0) {
      this.triggerGameOver('time_up');
    }
  }

  damageShield(amount = 1): void {
    if (this.status !== 'playing') return;

    this.shields = Math.max(0, this.shields - amount);
    if (this.shields <= 0) {
      this.triggerGameOver('shields_breached');
    }
  }

  addScore(pts: number): void {
    this.score += pts;
    this.wordsDestroyed++;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  triggerGameOver(reason: GameOverReason): void {
    this.status = 'gameover';
    this.gameOverReason = reason;
    saveData('type-strike-highscore', String(this.highScore));
    reportScore(this.score);
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

  restart(): void {
    this.start();
  }
}
