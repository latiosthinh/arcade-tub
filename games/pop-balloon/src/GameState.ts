import { saveData, loadData, reportScore } from '@arcade-carnival/playables-adapter';
import { PopResult } from './PopEngine';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export const ROUND_DURATION = 60.0;
export const STORAGE_KEY = 'pop-balloon-highscore';
export const BOMB_TIME_PENALTY = 5.0;
export const BOMB_SCORE_PENALTY = 300;

export class GameState {
  public status: GameStatus = 'ready';
  public score = 0;
  public highScore = 0;
  public timeRemaining = ROUND_DURATION;
  public streak = 0;
  public maxStreak = 0;
  public balloonsPopped = 0;
  public bombsHit = 0;

  constructor() {
    this.loadHighScore();
  }

  private loadHighScore(): void {
    const saved = loadData(STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        this.highScore = parsed;
        return;
      }
    }
    this.highScore = 0;
  }

  start(): void {
    this.status = 'playing';
    this.score = 0;
    this.timeRemaining = ROUND_DURATION;
    this.streak = 0;
    this.maxStreak = 0;
    this.balloonsPopped = 0;
    this.bombsHit = 0;
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

  recordPop(result: PopResult): void {
    if (this.status !== 'playing') return;

    if (result.isBomb) {
      this.bombsHit += 1;
      this.score = Math.max(0, this.score + result.pointsAwarded); // bomb gives -300 points
      this.timeRemaining = Math.max(0, this.timeRemaining - BOMB_TIME_PENALTY);
      this.streak = 0;
    } else {
      this.balloonsPopped += 1;
      this.score += result.pointsAwarded;
      this.streak = result.streak;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }
    }

    if (this.timeRemaining <= 0) {
      this.finalizeGame();
    }
  }

  update(dt: number): void {
    if (this.status !== 'playing') return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.finalizeGame();
    }
  }

  finalizeGame(): void {
    this.status = 'gameover';
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveData(STORAGE_KEY, String(this.highScore));
    }
    reportScore(this.score);
  }
}
